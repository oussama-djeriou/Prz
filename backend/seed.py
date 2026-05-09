import os
import json
from app import app, db
from models import User, Service
from werkzeug.security import generate_password_hash

def seed_data():
    with app.app_context():
        # Check if admin exists
        admin = User.query.filter_by(email='admin@prz.com').first()
        if not admin:
            admin = User(
                email='admin@prz.com',
                password_hash=generate_password_hash('admin123'),
                role='admin'
            )
            db.session.add(admin)
            print("Admin created: admin@prz.com / admin123")

        # ── New Service Structure ──────────────────────────────────────────────
        # Category (Domain) → Sub-category → Service with description + bullets
        services_data = [

            # ══════════════════════════════════════════════════════════════════
            # 1. PUBLIC RELATIONS  ←  العلاقات العامة
            # ══════════════════════════════════════════════════════════════════

            # Sub: Strategy  ←  الاستراتيجية
            {
                "title": "Annual PR Plan",
                "description": "Develop a comprehensive plan defining objectives, audience, and messages.",
                "category": "Public Relations",
                "sub_category": "Strategy",
                "bullets": [
                    "Current situation analysis",
                    "Target audience identification",
                    "Key message building",
                    "KPI performance indicators"
                ]
            },
            {
                "title": "Spokesperson Identity",
                "description": "Train your team to professionally deal with the media.",
                "category": "Public Relations",
                "sub_category": "Strategy",
                "bullets": [
                    "Identify the official spokesperson",
                    "Interview training",
                    "Official statement drafting"
                ]
            },
            {
                "title": "Audience and Market Analysis",
                "description": "In-depth study to understand your audience and competitive position in the market.",
                "category": "Public Relations",
                "sub_category": "Strategy",
                "bullets": [
                    "Audience segmentation",
                    "Competitor analysis",
                    "Detailed PDF report"
                ]
            },

            # Sub: Reputation  ←  السمعة
            {
                "title": "Digital Reputation Assessment",
                "description": "Comprehensive analysis of what is being said about your institution digitally.",
                "category": "Public Relations",
                "sub_category": "Reputation",
                "bullets": [
                    "Comprehensive platform scan",
                    "Sentiment analysis",
                    "Competitor comparison"
                ]
            },
            {
                "title": "Positive Reputation Building",
                "description": "An integrated program to improve your institution's image.",
                "category": "Public Relations",
                "sub_category": "Reputation",
                "bullets": [
                    "Targeted positive content",
                    "Influencer relations",
                    "Review management"
                ]
            },

            # Sub: Media  ←  الإعلام
            {
                "title": "Media Content Writing",
                "description": "Press releases, articles, and professional digital content.",
                "category": "Public Relations",
                "sub_category": "Media",
                "bullets": [
                    "Bilingual press releases",
                    "Opinion and news articles",
                    "Social media scripts"
                ]
            },
            {
                "title": "Visual Content Production",
                "description": "Design and produce professional visual content.",
                "category": "Public Relations",
                "sub_category": "Media",
                "bullets": [
                    "Post design",
                    "Reels videos",
                    "Motion graphics"
                ]
            },

            # Sub: Crisis  ←  الأزمات
            {
                "title": "Proactive Crisis Plan",
                "description": "Prepare a comprehensive crisis plan before it occurs.",
                "category": "Public Relations",
                "sub_category": "Crisis",
                "bullets": [
                    "Risk mapping",
                    "Response protocols",
                    "Ready-made response templates",
                    "Team training"
                ]
            },
            {
                "title": "Current Crisis Management",
                "description": "Immediate emergency intervention 7/24 to manage an ongoing crisis.",
                "category": "Public Relations",
                "sub_category": "Crisis",
                "bullets": [
                    "Crisis assessment within 2 hours",
                    "Immediate response plan",
                    "Real-time follow-up 7/24"
                ]
            },

            # ══════════════════════════════════════════════════════════════════
            # 2. ADVERTISING  ←  الإشهار
            # ══════════════════════════════════════════════════════════════════
            {
                "title": "Digital Advertising",
                "description": "For small projects.",
                "category": "Advertising",
                "sub_category": None,
                "bullets": [
                    "Manage one page",
                    "12 monthly posts",
                    "Advertising campaign",
                    "Monthly report"
                ]
            },
            {
                "title": "Dual Advertising",
                "description": "Traditional and digital advertising together.",
                "category": "Advertising",
                "sub_category": None,
                "bullets": [
                    "Manage two pages",
                    "20 monthly posts",
                    "Two advertising campaigns",
                    "500 Flyers",
                    "Weekly report"
                ]
            },
            {
                "title": "Comprehensive Campaign",
                "description": "For serious brands.",
                "category": "Advertising",
                "sub_category": None,
                "bullets": [
                    "Manage 3 pages",
                    "Daily content",
                    "Sponsored campaigns",
                    "Monthly video",
                    "Billboard"
                ]
            },

            # ══════════════════════════════════════════════════════════════════
            # 3. CONSULTATIONS  ←  الاستشارات
            # ══════════════════════════════════════════════════════════════════
            {
                "title": "Initial Consultation",
                "description": "Initial guidance for medical and legal matters.",
                "category": "Consultations",
                "sub_category": None,
                "bullets": [
                    "60-minute session",
                    "Recommendations report",
                    "Answer 2 questions"
                ]
            },
            {
                "title": "Comprehensive Consultation",
                "description": "Continuous legal and medical support.",
                "category": "Consultations",
                "sub_category": None,
                "bullets": [
                    "3 monthly sessions",
                    "Contract review",
                    "15-day follow-up"
                ]
            },

            # ══════════════════════════════════════════════════════════════════
            # 4. PRINTING  ←  الطباعة
            # ══════════════════════════════════════════════════════════════════
            {
                "title": "Basic Printing",
                "description": "Essential print materials for your needs.",
                "category": "Printing",
                "sub_category": None,
                "bullets": [
                    "Design + 500 Flyers",
                    "200 business cards",
                    "3-day delivery"
                ]
            },
            {
                "title": "Corporate Package",
                "description": "Complete visual identity.",
                "category": "Printing",
                "sub_category": None,
                "bullets": [
                    "Complete visual identity",
                    "1000 Flyers",
                    "Cards + Envelopes",
                    "Roll-up"
                ]
            },

            # ══════════════════════════════════════════════════════════════════
            # 5. MARKETING  ←  التسويق
            # ══════════════════════════════════════════════════════════════════
            {
                "title": "Digital Marketing",
                "description": "Effective digital presence.",
                "category": "Marketing",
                "sub_category": None,
                "bullets": [
                    "Manage two pages",
                    "Content plan",
                    "Basic SEO",
                    "Monthly report"
                ]
            },
            {
                "title": "Strategic Marketing",
                "description": "Measured and sustainable growth.",
                "category": "Marketing",
                "sub_category": None,
                "bullets": [
                    "Market study",
                    "Marketing plan",
                    "Competitor analysis",
                    "Weekly reports"
                ]
            },
        ]

        # Clear old services that are no longer in the catalog
        new_titles = {s['title'] for s in services_data}
        old_services = Service.query.all()
        for svc in old_services:
            if svc.title not in new_titles:
                db.session.delete(svc)
        db.session.commit()

        services_added = False
        for s in services_data:
            bullets_json = json.dumps(s['bullets'], ensure_ascii=False)
            existing = Service.query.filter_by(title=s['title']).first()
            if not existing:
                new_service = Service(
                    title=s['title'],
                    description=s['description'],
                    category=s['category'],
                    sub_category=s.get('sub_category'),
                    bullet_points=bullets_json
                )
                db.session.add(new_service)
                services_added = True
            else:
                changed = False
                if existing.category != s['category']:
                    existing.category = s['category']
                    changed = True
                if existing.description != s['description']:
                    existing.description = s['description']
                    changed = True
                if existing.sub_category != s.get('sub_category'):
                    existing.sub_category = s.get('sub_category')
                    changed = True
                if existing.bullet_points != bullets_json:
                    existing.bullet_points = bullets_json
                    changed = True
                if changed:
                    services_added = True

        db.session.commit()

        if services_added:
            print("Services added/updated successfully.")
        else:
            print("No new services to add.")

if __name__ == '__main__':
    seed_data()
