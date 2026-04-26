from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

SERVICE_CATEGORY_BY_TITLE = {
    'Logo Design': 'Design',
    'Web Development': 'Development',
    'Marketing': 'Marketing',
}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False) # admin, individual, company, expert
    phone = db.Column(db.String(20), nullable=True)
    
    # Individual & Expert fields
    full_name = db.Column(db.String(100), nullable=True)
    
    # Company fields
    company_name = db.Column(db.String(100), nullable=True)
    registration_number = db.Column(db.String(50), nullable=True)
    activity_type = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    
    # Expert fields
    birth_date = db.Column(db.Date, nullable=True)
    specialty = db.Column(db.String(100), nullable=True)
    cv_file = db.Column(db.String(255), nullable=True)
    approved = db.Column(db.Boolean, default=False)

    def to_dict(self):
        data = {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
        }
        if self.role in ['individual', 'expert']:
            data['full_name'] = self.full_name
        if self.role == 'company':
            data['company_name'] = self.company_name
            data['registration_number'] = self.registration_number
            data['activity_type'] = self.activity_type
            data['location'] = self.location
        if self.role == 'expert':
            data['birth_date'] = str(self.birth_date) if self.birth_date else None
            data['specialty'] = self.specialty
            data['cv_file'] = self.cv_file
            data['approved'] = self.approved
        return data

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False, default='Uncategorized')

    def to_dict(self):
        category = self.category
        if not category or category == 'Uncategorized':
            category = SERVICE_CATEGORY_BY_TITLE.get(self.title, 'Uncategorized')

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': category
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    expert_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, assigned, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    client = db.relationship('User', foreign_keys=[client_id])
    expert = db.relationship('User', foreign_keys=[expert_id])
    service = db.relationship('Service')

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'expert_id': self.expert_id,
            'service_id': self.service_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() + 'Z',
            'client': self.client.to_dict() if self.client else None,
            'expert': self.expert.to_dict() if self.expert else None,
            'service': self.service.to_dict() if self.service else None
        }

class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(40), nullable=False)
    company = db.Column(db.String(120), nullable=True)
    message = db.Column(db.Text, nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    expert_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    status = db.Column(db.String(20), default='pending', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    service = db.relationship('Service')
    user = db.relationship('User', foreign_keys=[user_id])
    expert = db.relationship('User', foreign_keys=[expert_id])

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'company': self.company,
            'message': self.message,
            'service_id': self.service_id,
            'user_id': self.user_id,
            'expert_id': self.expert_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() + 'Z',
            'service': self.service.to_dict() if self.service else None
        }

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('service_request.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    request = db.relationship('ServiceRequest')
    sender = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'request_id': self.request_id,
            'sender_id': self.sender_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() + 'Z'
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'sender_id': self.sender_id,
            'text': self.text,
            'created_at': self.created_at.isoformat() + 'Z'
        }
