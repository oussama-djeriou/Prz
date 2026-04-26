import os
from app import app, db
from models import User, Service
from werkzeug.security import generate_password_hash

def seed_data():
    with app.app_context():
        # Check if admin exists
        admin = User.query.filter_by(email='admin@gmail.com').first()
        if not admin:
            admin = User(
                email='admin@gmail.com',
                password_hash=generate_password_hash('123456'),
                role='admin'
            )
            db.session.add(admin)
            print("Admin created")
        
        # Categorized services
        services_data = [
            {"title": "Logo Design", "description": "Professional logo design and branding.", "category": "Design"},
            {"title": "Web Development", "description": "Modern website and web application development.", "category": "Development"},
            {"title": "Marketing", "description": "Marketing strategy and campaign support.", "category": "Marketing"},

            # 1. Legal Services
            {"title": "Initial Legal Consultation", "description": "Get an initial consultation on legal matters.", "category": "Legal Services"},
            {"title": "Contract Review", "description": "Professional review of corporate and individual contracts.", "category": "Legal Services"},
            {"title": "Organizational Legal Advice", "description": "Strategic legal advice for organizations.", "category": "Legal Services"},
            {"title": "Administrative Legal Support", "description": "Support with administrative legal documents and processes.", "category": "Legal Services"},
            
            # 2. Printing & Design
            {"title": "Visual Consultation", "description": "Consultation on visual brand identity and design.", "category": "Printing & Design"},
            {"title": "Client Referral to Specialists", "description": "Referral network for specialized design needs.", "category": "Printing & Design"},
            {"title": "Advertising Content Creation", "description": "Creative content for ads and promotional material.", "category": "Printing & Design"},
            
            # 3. Advertising Printing
            {"title": "Flyers", "description": "High-quality flyer printing for local distribution.", "category": "Advertising Printing"},
            {"title": "Brochures", "description": "Tri-fold and custom brochure printing.", "category": "Advertising Printing"},
            {"title": "Posters", "description": "Large format poster printing.", "category": "Advertising Printing"},
            {"title": "Roll-ups", "description": "Professional roll-up banners for events.", "category": "Advertising Printing"},
            
            # 4. Corporate Printing
            {"title": "Business Cards", "description": "Premium business card printing.", "category": "Corporate Printing"},
            {"title": "Administrative Files", "description": "Custom printed administrative folders and files.", "category": "Corporate Printing"},
            {"title": "Official Envelopes", "description": "Branded envelopes for corporate use.", "category": "Corporate Printing"},
            {"title": "Notebooks", "description": "Custom branded notebooks.", "category": "Corporate Printing"},
            
            # 5. Design + Printing
            {"title": "Full Visual Identity", "description": "Complete brand identity design and printing package.", "category": "Design + Printing"},
            {"title": "Printing Execution", "description": "End-to-end management of print execution.", "category": "Design + Printing"},
            {"title": "Fast Delivery", "description": "Expedited design and printing services.", "category": "Design + Printing"},
            
            # 6. Digital Marketing
            {"title": "Ads Management", "description": "Management of Google, Meta, and social media ads.", "category": "Digital Marketing"},
            {"title": "SEO Optimization", "description": "Search Engine Optimization for websites.", "category": "Digital Marketing"},
            {"title": "Email Marketing", "description": "Strategic email marketing campaigns.", "category": "Digital Marketing"},
            {"title": "Content Marketing", "description": "Creation and distribution of marketing content.", "category": "Digital Marketing"},
            
            # 7. Strategic Marketing
            {"title": "Market Study", "description": "Comprehensive market research and studies.", "category": "Strategic Marketing"},
            {"title": "Competitor Analysis", "description": "In-depth analysis of your competitors.", "category": "Strategic Marketing"},
            {"title": "Target Audience Definition", "description": "Identifying and profiling target audiences.", "category": "Strategic Marketing"},
            {"title": "Brand Building", "description": "Strategic development of your brand presence.", "category": "Strategic Marketing"},
            
            # 8. Field Marketing
            {"title": "Promotional Campaigns", "description": "On-ground promotional campaigns.", "category": "Field Marketing"},
            {"title": "Events Organization", "description": "Full-service event planning and organization.", "category": "Field Marketing"},
            {"title": "Sampling", "description": "Product sampling distribution campaigns.", "category": "Field Marketing"},
            {"title": "Promoters", "description": "Hiring and managing field promoters.", "category": "Field Marketing"},
            
            # 9. Public Relations
            {"title": "Strategy & Planning", "description": "Comprehensive PR strategy and planning.", "category": "Public Relations"},
            {"title": "Reputation Management", "description": "Monitoring and managing public reputation.", "category": "Public Relations"},
            {"title": "Crisis Management", "description": "Navigating and managing PR crises.", "category": "Public Relations"},
            {"title": "Media & Content", "description": "Media relations and PR content creation.", "category": "Public Relations"},
        ]
        
        services_added = False
        for s in services_data:
            existing = Service.query.filter_by(title=s['title']).first()
            if not existing:
                new_service = Service(title=s['title'], description=s['description'], category=s['category'])
                db.session.add(new_service)
                services_added = True
            elif existing.category != s['category'] or existing.description != s['description']:
                existing.category = s['category']
                existing.description = s['description']
                services_added = True
        
        if services_added:
            print("Services added/updated successfully.")
        else:
            print("No new services to add.")
            
        db.session.commit()

if __name__ == '__main__':
    seed_data()
