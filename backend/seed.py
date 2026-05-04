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

        services_data = [

            # ── 1. Public Relations ────────────────────────────────────────
            # Strategy & Planning
            {"title": "Annual PR Plan",              "description": "Preparation of the annual public relations plan.",         "category": "Public Relations"},
            {"title": "Situation Analysis",          "description": "In-depth analysis of the institution's current position.", "category": "Public Relations"},
            {"title": "Target Audience Identification","description": "Identifying and profiling the target audience.",         "category": "Public Relations"},
            {"title": "Key Messaging",               "description": "Building the institution's core communication messages.",  "category": "Public Relations"},
            {"title": "Roadmap Development",         "description": "Preparing an executive roadmap for PR activities.",        "category": "Public Relations"},
            {"title": "KPI Setting",                 "description": "Defining key performance indicators for PR campaigns.",    "category": "Public Relations"},
            # Audience & Market Analysis
            {"title": "Audience Research",           "description": "In-depth study to understand the target audience.",       "category": "Public Relations"},
            {"title": "Competitor Analysis PR",      "description": "Analysis of competitors from a PR perspective.",          "category": "Public Relations"},
            {"title": "Audience Segmentation",       "description": "Segmentation of the audience into actionable groups.",    "category": "Public Relations"},
            {"title": "Communication Channels",      "description": "Identifying the most effective communication channels.",  "category": "Public Relations"},
            {"title": "Analytical Reports",          "description": "Preparation of detailed analytical reports.",             "category": "Public Relations"},

            # ── 2. Reputation Management ───────────────────────────────────
            # Reputation Analysis
            {"title": "Institution Image Analysis",  "description": "Analysis of the institution's public image.",            "category": "Reputation Management"},
            {"title": "Online Monitoring",           "description": "Monitoring what is being said about the institution online.", "category": "Reputation Management"},
            {"title": "Media Coverage Measurement",  "description": "Measuring the volume and quality of media coverage.",    "category": "Reputation Management"},
            {"title": "Competitor Benchmarking",     "description": "Comparing reputation against competitors.",              "category": "Reputation Management"},
            {"title": "Reputation Reports",          "description": "Preparation of reputation reports and recommendations.", "category": "Reputation Management"},
            # Reputation Building
            {"title": "Image Improvement",           "description": "Improving the institution's overall public image.",      "category": "Reputation Management"},
            {"title": "Positive Content Creation",   "description": "Creating positive content to strengthen reputation.",   "category": "Reputation Management"},
            {"title": "Influencer Collaboration",    "description": "Collaborating with influencers to build brand trust.",  "category": "Reputation Management"},
            {"title": "Community Management",        "description": "Managing accounts and responding to comments.",          "category": "Reputation Management"},
            {"title": "Continuous Monitoring",       "description": "Ongoing monitoring of reputation and sentiment.",        "category": "Reputation Management"},

            # ── 3. Crisis Management ───────────────────────────────────────
            # Crisis Plan
            {"title": "Proactive Crisis Plan",       "description": "Developing a proactive crisis management plan.",        "category": "Crisis Management"},
            {"title": "Risk Analysis",               "description": "Identifying and assessing potential risks.",            "category": "Crisis Management"},
            {"title": "Crisis Scenarios",            "description": "Preparing ready-made scenarios for various crises.",   "category": "Crisis Management"},
            {"title": "Team Training",               "description": "Training the team to respond to crises effectively.",  "category": "Crisis Management"},
            # Crisis Response
            {"title": "Immediate Crisis Intervention","description": "Immediate response at the onset of a crisis.",        "category": "Crisis Management"},
            {"title": "Professional Crisis Decisions","description": "Expert-level decision-making during a crisis.",       "category": "Crisis Management"},
            {"title": "Real-Time Follow-Up",         "description": "Real-time monitoring and response during crisis.",     "category": "Crisis Management"},
            {"title": "Official Media Statements",   "description": "Crafting and issuing official media responses.",       "category": "Crisis Management"},
            {"title": "Continuous Crisis Support",   "description": "Continuous support throughout the crisis period.",    "category": "Crisis Management"},
            # Post-Crisis
            {"title": "Trust Restoration",           "description": "Restoring public trust after a crisis.",              "category": "Crisis Management"},
            {"title": "Post-Crisis Image Improvement","description": "Improving the institution's image after a crisis.",  "category": "Crisis Management"},
            {"title": "Damage Assessment",           "description": "Evaluating the impact and damages caused by the crisis.", "category": "Crisis Management"},
            {"title": "Performance Improvement",     "description": "Enhancing performance based on post-crisis lessons.", "category": "Crisis Management"},

            # ── 4. Media ───────────────────────────────────────────────────
            # Media Content Writing
            {"title": "Press Releases",              "description": "Writing professional press releases.",                 "category": "Media"},
            {"title": "Article Writing",             "description": "Writing articles for media and online publication.",  "category": "Media"},
            {"title": "Digital Content",             "description": "Preparing digital content for various platforms.",    "category": "Media"},
            {"title": "Communication Scripts",       "description": "Writing communication and messaging scripts.",        "category": "Media"},
            {"title": "Multilingual Content",        "description": "Creating content in multiple languages.",             "category": "Media"},
            # Media Relations
            {"title": "Media Network Building",      "description": "Building and maintaining a network of media contacts.", "category": "Media"},
            {"title": "Press Release Distribution",  "description": "Distributing press releases to relevant media.",     "category": "Media"},
            {"title": "Coverage Follow-Up",          "description": "Following up on and monitoring media coverage.",      "category": "Media"},
            {"title": "Press Conferences",           "description": "Organizing and managing press conferences.",          "category": "Media"},
            # Visual Content Production
            {"title": "Visual Design",               "description": "Designing professional visual content.",             "category": "Media"},
            {"title": "Professional Posts",          "description": "Creating polished social media posts.",              "category": "Media"},
            {"title": "Short Videos",                "description": "Producing short-form promotional videos.",           "category": "Media"},
            {"title": "Motion Graphics",             "description": "Designing motion graphics for digital platforms.",   "category": "Media"},

            # ── 5. Digital Reputation ─────────────────────────────────────
            # Digital Reputation Assessment
            {"title": "Digital Presence Analysis",   "description": "Comprehensive analysis of the digital presence.",   "category": "Digital Reputation"},
            {"title": "General Sentiment Measurement","description": "Measuring the public's overall digital sentiment.", "category": "Digital Reputation"},
            {"title": "Comments Analysis",           "description": "Analyzing comments and audience reactions online.", "category": "Digital Reputation"},
            {"title": "Digital Competitor Benchmarking","description": "Comparing digital reputation against competitors.", "category": "Digital Reputation"},
            # Digital Reputation Building
            {"title": "Digital Presence Improvement","description": "Enhancing the institution's digital footprint.",   "category": "Digital Reputation"},
            {"title": "Engagement Management",       "description": "Managing and growing audience interaction online.", "category": "Digital Reputation"},
            {"title": "Professional Content Publishing","description": "Publishing professional content across channels.", "category": "Digital Reputation"},
            {"title": "Performance Tracking",        "description": "Monitoring and reporting on digital performance.", "category": "Digital Reputation"},

            # ── 6. Marketing ──────────────────────────────────────────────
            # Digital Marketing
            {"title": "Ads Management",              "description": "Managing digital advertising campaigns.",           "category": "Marketing"},
            {"title": "SEO Optimization",            "description": "Search engine optimization for websites.",          "category": "Marketing"},
            {"title": "Email Marketing",             "description": "Strategic email marketing campaigns.",              "category": "Marketing"},
            {"title": "Content Marketing",           "description": "Creation and distribution of marketing content.",  "category": "Marketing"},
            # Strategic Marketing
            {"title": "Market Study",                "description": "Comprehensive market research and studies.",        "category": "Marketing"},
            {"title": "Competitor Analysis Mkt",     "description": "In-depth analysis of competitors.",                "category": "Marketing"},
            {"title": "Target Audience Definition",  "description": "Identifying and profiling target audiences.",      "category": "Marketing"},
            {"title": "Brand Building",              "description": "Strategic development of brand presence.",          "category": "Marketing"},
            # Field Marketing
            {"title": "Promotional Campaigns",       "description": "On-ground promotional campaigns.",                 "category": "Marketing"},
            {"title": "Print Distribution",          "description": "Distribution of promotional print materials.",     "category": "Marketing"},
            {"title": "Events Organization",         "description": "Full-service event planning and organization.",    "category": "Marketing"},
            {"title": "Promoters",                   "description": "Hiring and managing field promoters.",             "category": "Marketing"},

            # ── 7. Advertising Printing ────────────────────────────────────
            {"title": "Flyers",                      "description": "High-quality flyer printing for distribution.",   "category": "Advertising Printing"},
            {"title": "Brochures",                   "description": "Tri-fold and custom brochure printing.",           "category": "Advertising Printing"},
            {"title": "Posters",                     "description": "Large format poster printing.",                   "category": "Advertising Printing"},
            {"title": "Roll-ups",                    "description": "Professional roll-up banners for events.",        "category": "Advertising Printing"},

            # ── 8. Corporate Printing ─────────────────────────────────────
            {"title": "Business Cards",              "description": "Premium business card printing.",                 "category": "Corporate Printing"},
            {"title": "Administrative Files",        "description": "Custom printed administrative folders and files.", "category": "Corporate Printing"},
            {"title": "Official Envelopes",          "description": "Branded envelopes for corporate use.",            "category": "Corporate Printing"},
            {"title": "Notebooks",                   "description": "Custom branded notebooks.",                       "category": "Corporate Printing"},

            # ── 9. Design & Printing ──────────────────────────────────────
            {"title": "Visual Identity Design",      "description": "Full visual identity design and printing package.", "category": "Design & Printing"},
            {"title": "Printing Execution",          "description": "End-to-end management of print execution.",      "category": "Design & Printing"},
            {"title": "Fast Delivery",               "description": "Expedited design and printing services.",        "category": "Design & Printing"},
            {"title": "High Quality Output",         "description": "Premium quality output for all print jobs.",     "category": "Design & Printing"},

            # ── 10. Legal Services ────────────────────────────────────────
            {"title": "Initial Legal Consultation",  "description": "Initial consultation on legal matters.",         "category": "Legal Services"},
            {"title": "Contract Review",             "description": "Professional review of corporate and individual contracts.", "category": "Legal Services"},
            {"title": "Regulatory Advice",           "description": "Regulatory and compliance advice for businesses.", "category": "Legal Services"},
            {"title": "Administrative Legal Support","description": "Support with administrative legal documents.",   "category": "Legal Services"},
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
