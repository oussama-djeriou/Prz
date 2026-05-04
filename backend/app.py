import os
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from flask_mail import Mail, Message as MailMessage
from sqlalchemy import inspect, text
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

from config import Config
from models import db, User, Service, Order, Message, ServiceRequest, ChatMessage

app = Flask(__name__)
app.config.from_object(Config)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'djoussama206@gmail.com'
app.config['MAIL_PASSWORD'] = 'ewwpnvaucaejwepb'

CORS(app)
db.init_app(app)
jwt = JWTManager(app)
mail = Mail(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

with app.app_context():
    db.create_all()
    inspector = inspect(db.engine)
    if 'service_request' in inspector.get_table_names():
        columns = [column['name'] for column in inspector.get_columns('service_request')]
        if 'status' not in columns:
            db.session.execute(text("ALTER TABLE service_request ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'"))
            db.session.commit()
        if 'user_id' not in columns:
            db.session.execute(text("ALTER TABLE service_request ADD COLUMN user_id INTEGER"))
            db.session.commit()
        if 'expert_id' not in columns:
            db.session.execute(text("ALTER TABLE service_request ADD COLUMN expert_id INTEGER"))
            db.session.commit()

    if 'chat_message' not in inspector.get_table_names():
        db.create_all()

    admin = User.query.filter_by(email='admin@prz.com').first()
    if not admin:
        admin = User(
            email='admin@prz.com',
            password_hash=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()

# --- AUTH ROUTES ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    if request.content_type and request.content_type.startswith('application/json'):
        data = request.get_json()
    else:
        data = request.form
        
    if not data:
        return jsonify({'message': 'Invalid request data'}), 400

    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    phone = data.get('phone')

    if not email or not password or not role:
        return jsonify({'message': 'Missing basic fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 400

    new_user = User(
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
        phone=phone
    )

    if role == 'individual':
        new_user.full_name = data.get('full_name')
    elif role == 'company':
        new_user.company_name = data.get('company_name')
        new_user.registration_number = data.get('registration_number')
        new_user.activity_type = data.get('activity_type')
        new_user.location = data.get('location')
    elif role == 'expert':
        new_user.full_name = data.get('full_name')
        birth_date_str = data.get('birth_date')
        if birth_date_str:
            new_user.birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
        new_user.specialty = data.get('specialty')
        
        # Handle CV upload
        if 'cv_file' in request.files:
            file = request.files['cv_file']
            if file and file.filename.endswith('.pdf'):
                filename = secure_filename(f"{email}_{file.filename}")
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                new_user.cv_file = filename
            else:
                return jsonify({'message': 'CV must be a PDF'}), 400

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    if user.role == 'expert' and not user.approved:
        return jsonify({'message': 'Account pending admin approval'}), 403

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

# --- SERVICE ROUTES ---

@app.route('/api/services', methods=['GET'])
def get_services():
    services = Service.query.all()
    return jsonify([s.to_dict() for s in services]), 200

@app.route('/api/services/<int:service_id>', methods=['GET'])
def get_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({'message': 'Service not found'}), 404
    return jsonify(service.to_dict()), 200

@app.route('/api/requests', methods=['POST'])
@jwt_required()
def create_service_request():
    data = request.get_json() or {}
    required_fields = ['name', 'email', 'phone', 'message', 'service_id']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({'message': 'Missing required fields', 'fields': missing_fields}), 400

    service = Service.query.get(data.get('service_id'))
    if not service:
        return jsonify({'message': 'Service not found'}), 404

    current_user_id = get_jwt_identity()

    service_request = ServiceRequest(
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone'),
        company=data.get('company'),
        message=data.get('message'),
        service_id=service.id,
        user_id=current_user_id,
        status='pending'
    )
    db.session.add(service_request)
    db.session.commit()

    admin = User.query.filter_by(role='admin').first()
    if admin:
        welcome_message = ChatMessage(
            request_id=service_request.id,
            sender_id=admin.id,
            content='مرحباً بك! لقد استلمنا طلبك وسيتم مراجعته والتواصل معك قريباً لربطك بالخبير المناسب.'
        )
        db.session.add(welcome_message)
        db.session.commit()

    # Send receipt email
    try:
        send_request_received_email(service_request)
    except Exception as e:
        print(f"Error sending receipt email: {e}")

    return jsonify(service_request.to_dict()), 201

@app.route('/api/requests', methods=['GET'])
@jwt_required()
def get_service_requests():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role == 'admin':
        requests = ServiceRequest.query.order_by(ServiceRequest.created_at.desc()).all()
    elif user.role == 'expert':
        requests = ServiceRequest.query.filter_by(expert_id=user.id).order_by(ServiceRequest.created_at.desc()).all()
    else:
        requests = ServiceRequest.query.filter_by(user_id=user.id).order_by(ServiceRequest.created_at.desc()).all()
        
    return jsonify([service_request.to_dict() for service_request in requests]), 200

def send_email(to, subject, body):
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        raise RuntimeError('MAIL_USERNAME and MAIL_PASSWORD must be configured')

    msg = MailMessage(
        subject,
        sender=app.config['MAIL_USERNAME'],
        recipients=[to]
    )
    msg.body = body
    mail.send(msg)

@app.route('/test-email')
def test_email():
    send_email(
        app.config['MAIL_USERNAME'],
        'PRZ Test Email',
        'This is a test email from PRZ platform.'
    )
    return 'Email sent!'

def send_request_received_email(service_request):
    service_title = service_request.service.title if service_request.service else 'Requested service'
    subject = f'PRZ - Request Received #{service_request.id}'
    body = f"""Hello {service_request.name},
We have successfully received your request for "{service_title}".
Our team is currently reviewing it and will get back to you soon.
You can track your request status in your dashboard.
Thank you for choosing PRZ."""
    send_email(service_request.email, subject, body)

def send_request_status_email(service_request):
    service_title = service_request.service.title if service_request.service else 'Requested service'

    if service_request.status == 'accepted':
        subject = 'PRZ - Request Accepted'
        chat_link = f"http://localhost:5173/chat/{service_request.id}"
        body = f"""Hello {service_request.name},
Your request for "{service_title}" has been accepted.
You can now start chatting with your assigned expert to get the service.
Click the link below to open the chat:
{chat_link}
Thank you for choosing PRZ."""
    else:
        subject = 'PRZ - Request Update'
        body = f"""Hello {service_request.name},
We regret to inform you that your request for "{service_title}" was not accepted.
Please feel free to submit another request.
Thank you for your understanding."""

    send_email(service_request.email, subject, body)

def set_service_request_status_and_send_email(request_id, status):
    service_request = ServiceRequest.query.get(request_id)
    if not service_request:
        return None, (jsonify({'message': 'Request not found'}), 404)

    service_request.status = status
    db.session.commit()

    try:
        send_request_status_email(service_request)
    except Exception as exc:
        return service_request, (jsonify({
            'message': 'Request status updated, but email could not be sent',
            'email_error': str(exc),
            'request': service_request.to_dict()
        }), 500)

    return service_request, None

@app.route('/api/requests/<int:request_id>/status', methods=['PUT'])
def update_service_request_status(request_id):
    data = request.get_json() or {}
    status = data.get('status')

    if status not in ['accepted', 'rejected']:
        return jsonify({'message': 'Status must be accepted or rejected'}), 400

    service_request, error_response = set_service_request_status_and_send_email(request_id, status)
    if error_response:
        return error_response

    return jsonify(service_request.to_dict()), 200

# --- ADMIN ROUTES ---

def require_admin():
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    if not admin or admin.role != 'admin':
        return None, (jsonify({'message': 'Unauthorized'}), 403)
    return admin, None

def is_chat_participant(user, service_request):
    if not user:
        return False
    if user.role == 'admin':
        return True
    if service_request.user_id and service_request.user_id == user.id:
        return True
    if service_request.expert_id and service_request.expert_id == user.id:
        return True
    return False

@app.route('/api/admin/accept/<int:request_id>', methods=['PUT'])
@jwt_required()
def accept_service_request(request_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != "admin":
        return jsonify({"msg": "Admins only"}), 403

    data = request.get_json() or {}
    expert_id = data.get('expert_id')
    if not expert_id:
        return jsonify({"msg": "Expert assignment required"}), 400

    service_request = ServiceRequest.query.get(request_id)
    if not service_request:
        return jsonify({'message': 'Request not found'}), 404

    expert = User.query.get(expert_id)
    if not expert or expert.role != 'expert':
        return jsonify({"msg": "Invalid expert selected"}), 400

    service_request.expert_id = expert_id
    service_request.status = 'accepted'
    db.session.commit()

    try:
        send_request_status_email(service_request)
    except Exception as exc:
        return jsonify({
            'message': 'Request accepted, but email could not be sent',
            'email_error': str(exc),
            'request_id': service_request.id,
            'status': service_request.status
        }), 500

    return jsonify({
        "id": service_request.id,
        "request_id": service_request.id,
        "status": service_request.status,
        "expert_id": service_request.expert_id
    }), 200

@app.route('/api/admin/reject/<int:request_id>', methods=['PUT'])
@jwt_required()
def reject_service_request(request_id):
    user_id = get_jwt_identity()
    print("USER:", user_id)
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    if user.role != "admin":
        return jsonify({"msg": "Admins only"}), 403

    service_request, error_response = set_service_request_status_and_send_email(request_id, 'rejected')
    if error_response:
        return error_response

    return jsonify({
        "id": service_request.id,
        "status": service_request.status
    }), 200

@app.route('/api/chat/<int:request_id>', methods=['GET'])
@jwt_required()
def get_chat_messages(request_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    service_request = ServiceRequest.query.get(request_id)

    if not service_request:
        return jsonify({'message': 'Request not found'}), 404
    if not is_chat_participant(user, service_request):
        return jsonify({'message': 'Unauthorized'}), 403

    messages = ChatMessage.query.filter_by(request_id=request_id).order_by(ChatMessage.created_at.asc()).all()
    return jsonify([message.to_dict() for message in messages]), 200

@app.route('/api/chat/<int:request_id>', methods=['POST'])
@jwt_required()
def send_chat_message(request_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    service_request = ServiceRequest.query.get(request_id)

    if not service_request:
        return jsonify({'message': 'Request not found'}), 404
    if not is_chat_participant(user, service_request):
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json() or {}
    content = (data.get('message') or '').strip()
    if not content:
        return jsonify({'message': 'Message is required'}), 400

    chat_message = ChatMessage(
        request_id=request_id,
        sender_id=current_user_id,
        content=content
    )
    db.session.add(chat_message)
    db.session.commit()
    return jsonify(chat_message.to_dict()), 201

@app.route('/api/admin/experts', methods=['GET'])
@jwt_required()
def get_experts():
    _, error_response = require_admin()
    if error_response:
        return error_response
    
    experts = User.query.filter_by(role='expert').all()
    return jsonify([e.to_dict() for e in experts]), 200

@app.route('/api/admin/experts/<int:expert_id>/approve', methods=['PUT'])
@jwt_required()
def approve_expert(expert_id):
    _, error_response = require_admin()
    if error_response:
        return error_response
    
    expert = User.query.get(expert_id)
    if not expert or expert.role != 'expert':
        return jsonify({'message': 'Expert not found'}), 404
        
    expert.approved = True
    db.session.commit()
    return jsonify({'message': 'Expert approved'}), 200

@app.route('/api/admin/experts/<int:expert_id>/reject', methods=['DELETE'])
@jwt_required()
def reject_expert(expert_id):
    _, error_response = require_admin()
    if error_response:
        return error_response
    
    expert = User.query.get(expert_id)
    if not expert or expert.role != 'expert':
        return jsonify({'message': 'Expert not found'}), 404
        
    db.session.delete(expert)
    db.session.commit()
    return jsonify({'message': 'Expert rejected and removed'}), 200

@app.route('/api/admin/services', methods=['POST'])
@jwt_required()
def create_service():
    _, error_response = require_admin()
    if error_response:
        return error_response
    
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    category = data.get('category')
    
    if not title or not description:
        return jsonify({'message': 'Title and description are required'}), 400
        
    new_service = Service(title=title, description=description, category=category or 'Uncategorized')
    db.session.add(new_service)
    db.session.commit()
    
    return jsonify(new_service.to_dict()), 201

@app.route('/api/admin/services/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service(service_id):
    _, error_response = require_admin()
    if error_response:
        return error_response
        
    service = Service.query.get(service_id)
    if not service:
        return jsonify({'message': 'Service not found'}), 404
        
    data = request.get_json() or {}
    if 'title' in data:
        service.title = data['title']
    if 'description' in data:
        service.description = data['description']
    if 'category' in data:
        service.category = data['category']
        
    db.session.commit()
    return jsonify(service.to_dict()), 200

@app.route('/api/admin/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    _, error_response = require_admin()
    if error_response:
        return error_response
        
    service = Service.query.get(service_id)
    if not service:
        return jsonify({'message': 'Service not found'}), 404
        
    db.session.delete(service)
    db.session.commit()
    return jsonify({'message': 'Service deleted'}), 200

# --- ORDER ROUTES ---

@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role not in ['individual', 'company']:
        return jsonify({'message': 'Only clients can create orders'}), 403
        
    data = request.json
    service_id = data.get('service_id')
    
    if not service_id:
        return jsonify({'message': 'Service ID required'}), 400
        
    new_order = Order(client_id=user.id, service_id=service_id)
    db.session.add(new_order)
    db.session.commit()
    
    return jsonify(new_order.to_dict()), 201

@app.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role == 'admin':
        orders = Order.query.all()
    elif user.role == 'expert':
        orders = Order.query.filter_by(expert_id=user.id).all()
    else:
        orders = Order.query.filter_by(client_id=user.id).all()
        
    return jsonify([o.to_dict() for o in orders]), 200

@app.route('/api/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'message': 'Order not found'}), 404
        
    if user.role != 'admin' and order.client_id != user.id and order.expert_id != user.id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    return jsonify(order.to_dict()), 200

@app.route('/api/orders/<int:order_id>/assign', methods=['PUT'])
@jwt_required()
def assign_order(order_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    expert_id = data.get('expert_id')
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found'}), 404
        
    expert = User.query.get(expert_id)
    if not expert or expert.role != 'expert' or not expert.approved:
        return jsonify({'message': 'Invalid expert'}), 400
        
    order.expert_id = expert_id
    order.status = 'assigned'
    db.session.commit()
    
    return jsonify(order.to_dict()), 200

@app.route('/api/orders/<int:order_id>/complete', methods=['PUT'])
@jwt_required()
def complete_order(order_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'message': 'Order not found'}), 404
        
    # Either admin or assigned expert can complete
    if user.role != 'admin' and order.expert_id != user.id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    order.status = 'completed'
    db.session.commit()
    
    return jsonify(order.to_dict()), 200

# --- CHAT ROUTES ---

@app.route('/api/orders/<int:order_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(order_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'message': 'Order not found'}), 404
        
    if user.role != 'admin' and order.client_id != user.id and order.expert_id != user.id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    messages = Message.query.filter_by(order_id=order_id).order_by(Message.created_at).all()
    return jsonify([m.to_dict() for m in messages]), 200

@app.route('/api/orders/<int:order_id>/messages', methods=['POST'])
@jwt_required()
def send_message(order_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({'message': 'Order not found'}), 404
        
    if user.role != 'admin' and order.client_id != user.id and order.expert_id != user.id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    text = data.get('text')
    if not text:
        return jsonify({'message': 'Text required'}), 400
        
    new_message = Message(order_id=order_id, sender_id=user.id, text=text)
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify(new_message.to_dict()), 201

# --- UPLOADS ---
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
