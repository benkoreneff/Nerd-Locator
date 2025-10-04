"""
Skills router - handles skill suggestions and creation
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List

from db import get_db
from models import Skill
from schemas import SkillResponse, SkillCreateRequest, SkillSuggestResponse

router = APIRouter()

def normalize_skill_name(name: str) -> str:
    """Normalize skill name: trim, collapse spaces, Title Case"""
    return ' '.join(name.strip().split()).title()

@router.get("/suggest", response_model=SkillSuggestResponse)
async def suggest_skills(
    q: str = Query("", description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    db: Session = Depends(get_db)
):
    """Get skill suggestions with ranking: prefix matches first, then contains matches"""
    
    if not q.strip():
        # Empty query - return top canonical skills alphabetically
        skills = db.query(Skill).filter(
            Skill.canonical == True
        ).order_by(Skill.name).limit(limit).all()
    else:
        # Search with ranking
        search_term = q.strip().lower()
        
        # Get prefix matches first (higher priority)
        prefix_matches = db.query(Skill).filter(
            func.lower(Skill.name).like(f"{search_term}%")
        ).order_by(Skill.name).all()
        
        # Get contains matches (lower priority)
        contains_matches = db.query(Skill).filter(
            func.lower(Skill.name).like(f"%{search_term}%"),
            ~Skill.id.in_([s.id for s in prefix_matches])  # Exclude prefix matches
        ).order_by(Skill.name).all()
        
        # Combine with prefix matches first
        skills = prefix_matches + contains_matches
        skills = skills[:limit]
    
    results = [
        SkillResponse(id=skill.id, name=skill.name, canonical=skill.canonical)
        for skill in skills
    ]
    
    return SkillSuggestResponse(results=results)

@router.post("/", response_model=SkillResponse)
async def create_skill(
    request: SkillCreateRequest,
    db: Session = Depends(get_db)
):
    """Create a new skill or return existing if duplicate (case-insensitive)"""
    
    normalized_name = normalize_skill_name(request.name)
    
    # Check for existing skill (case-insensitive)
    existing_skill = db.query(Skill).filter(
        func.lower(Skill.name) == normalized_name.lower()
    ).first()
    
    if existing_skill:
        return SkillResponse(
            id=existing_skill.id,
            name=existing_skill.name,
            canonical=existing_skill.canonical
        )
    
    # Create new skill
    new_skill = Skill(
        name=normalized_name,
        canonical=False  # User-created skills are non-canonical
    )
    
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    
    return SkillResponse(
        id=new_skill.id,
        name=new_skill.name,
        canonical=new_skill.canonical
    )

def seed_canonical_skills(db: Session):
    """Seed canonical skills if table is empty"""
    
    # Check if skills table is empty
    if db.query(Skill).first():
        return  # Already seeded
    
    canonical_skills = [
        "Computer Science", "First Aid", "Emergency Care", "Logistics", "GIS",
        "Nursing", "Radio Operations", "Chainsaw", "Electrical Work", "Python",
        "Crisis Communications", "Water Purification", "Search and Rescue",
        "Medical Equipment", "Network Administration", "Database Management",
        "Project Management", "Risk Assessment", "Team Leadership", "Public Speaking",
        "Technical Writing", "Quality Assurance", "System Administration", "Cybersecurity",
        "Data Analysis", "Machine Learning", "Web Development", "Mobile Development",
        "Cloud Computing", "DevOps", "Containerization", "API Development",
        "Software Testing", "Agile Methodology", "Scrum Master", "Product Management",
        "User Experience Design", "Graphic Design", "Video Editing", "Photography",
        "Social Media Management", "Digital Marketing", "Content Creation", "Copywriting",
        "Translation", "Language Teaching", "Curriculum Development", "Training",
        "Counseling", "Psychology", "Social Work", "Community Outreach",
        "Event Planning", "Fundraising", "Grant Writing", "Volunteer Coordination",
        "Construction", "Carpentry", "Plumbing", "HVAC", "Welding", "Masonry",
        "Roofing", "Painting", "Flooring", "Insulation", "Drywall", "Tiling",
        "Heavy Machinery Operation", "Forklift Operation", "Crane Operation",
        "Truck Driving", "Bus Driving", "Pilot License", "Maritime Operations",
        "Supply Chain Management", "Inventory Management", "Warehouse Operations",
        "Fleet Management", "Route Optimization", "Fuel Management", "Vehicle Maintenance",
        "Mechanical Repair", "Electrical Repair", "Electronics Repair", "Appliance Repair",
        "Computer Repair", "Network Troubleshooting", "Security Systems", "Surveillance",
        "Fire Safety", "Hazardous Materials", "Environmental Cleanup", "Waste Management",
        "Water Treatment", "Power Generation", "Solar Installation", "Wind Energy",
        "Geothermal Systems", "Energy Efficiency", "Building Automation", "Smart Grid",
        "Agriculture", "Livestock Management", "Crop Management", "Irrigation",
        "Equipment Operation", "Pest Control", "Soil Analysis", "Greenhouse Management",
        "Forestry", "Wildlife Management", "Conservation", "Ecology", "Botany",
        "Geology", "Meteorology", "Oceanography", "Environmental Science"
    ]
    
    for skill_name in canonical_skills:
        skill = Skill(name=skill_name, canonical=True)
        db.add(skill)
    
    db.commit()
    print(f"Seeded {len(canonical_skills)} canonical skills")
