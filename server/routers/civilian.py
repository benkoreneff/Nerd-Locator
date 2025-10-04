"""
Civilian router - handles civilian profile submission and retrieval
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_

from db import get_db
from models import User, Profile, Resource, Skill
from schemas import CivilianSubmitRequest, CivilianMeResponse, UserResponse, ProfileResponse
from auth import require_civilian, get_user_id_hash
from services.tagger import tagger
from services.audit import audit
from sqlalchemy import func

def normalize_skill_name(name: str) -> str:
    """Normalize skill name: trim, collapse spaces, Title Case"""
    return ' '.join(name.strip().split()).title()

def resolve_skills(db: Session, skills_data: list) -> list:
    """Resolve skills from mixed format (strings or SkillSpec objects) to skill names"""
    resolved_skills = []
    
    for skill_item in skills_data:
        if isinstance(skill_item, str):
            # Legacy string format - normalize and use as-is
            resolved_skills.append(normalize_skill_name(skill_item))
        else:
            # SkillSpec object
            if skill_item.id:
                # Resolve by ID
                skill = db.query(Skill).filter(Skill.id == skill_item.id).first()
                if skill:
                    resolved_skills.append(skill.name)
            elif skill_item.name:
                # Resolve by name or create if not exists
                normalized_name = normalize_skill_name(skill_item.name)
                
                # Check if skill exists (case-insensitive)
                existing_skill = db.query(Skill).filter(
                    func.lower(Skill.name) == normalized_name.lower()
                ).first()
                
                if existing_skill:
                    resolved_skills.append(existing_skill.name)
                else:
                    # Create new skill
                    new_skill = Skill(name=normalized_name, canonical=False)
                    db.add(new_skill)
                    db.commit()
                    resolved_skills.append(normalized_name)
    
    return resolved_skills

router = APIRouter()

@router.get("/me", response_model=CivilianMeResponse)
async def get_me(
    current_user: dict = Depends(require_civilian),
    db: Session = Depends(get_db)
):
    """Get current civilian's profile and user data"""
    
    user_id_hash = current_user["national_id_hash"]
    
    # Find user by national_id_hash
    user = db.query(User).filter(User.national_id_hash == user_id_hash).first()
    
    if not user:
        # Create user from current_user data
        from datetime import datetime
        user = User(
            national_id_hash=user_id_hash,
            full_name=current_user["full_name"],
            dob=datetime.fromisoformat(current_user["dob"]),
            address=current_user["address"],
            lat=current_user["lat"],
            lon=current_user["lon"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Get profile if exists
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    
    user_response = UserResponse(
        id=user.id,
        full_name=user.full_name,
        dob=user.dob,
        address=user.address,
        lat=user.lat,
        lon=user.lon,
        created_at=user.created_at
    )
    
    profile_response = None
    if profile:
        profile_response = ProfileResponse(
            id=profile.id,
            education_level=profile.education_level,
            industry=profile.industry,
            skills=profile.skills,
            free_text=profile.free_text,
            availability=profile.availability,
            capability_score=profile.capability_score,
            tags_json=profile.tags_json,
            skill_levels=profile.skill_levels,
            last_updated=profile.last_updated,
            status=profile.status
        )
    
    return CivilianMeResponse(
        user=user_response,
        profile=profile_response
    )

@router.post("/submit")
async def submit_profile(
    request: CivilianSubmitRequest,
    current_user: dict = Depends(require_civilian),
    db: Session = Depends(get_db)
):
    """Submit civilian profile (idempotent by submission_id)"""
    
    if not request.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent is required to submit profile"
        )
    
    user_id_hash = current_user["national_id_hash"]
    
    # Find or create user
    user = db.query(User).filter(User.national_id_hash == user_id_hash).first()
    if not user:
        from datetime import datetime
        user = User(
            national_id_hash=user_id_hash,
            full_name=current_user["full_name"],
            dob=datetime.fromisoformat(current_user["dob"]),
            address=current_user["address"],
            lat=current_user["lat"],
            lon=current_user["lon"]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Resolve skills from mixed format
    resolved_skills = resolve_skills(db, request.skills)
    
    # Check if profile already exists with this submission_id
    # (In a real system, you'd store submission_id in the database)
    existing_profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    
    if existing_profile:
        # Update existing profile
        existing_profile.education_level = request.education_level
        existing_profile.industry = request.industry
        existing_profile.skills = resolved_skills
        existing_profile.free_text = request.free_text
        existing_profile.skill_levels = request.skill_levels
        # Availability is automatically set to "available" when profile is submitted
        existing_profile.availability = "available"
        
        # Regenerate tags and score
        resources_data = [r.dict() for r in request.resources] if request.resources else []
        tags, score = tagger.generate_tags_and_score(
            education_level=request.education_level,
            skills=resolved_skills,
            free_text=request.free_text or "",
            availability="available",
            resources=resources_data,
            industry=request.industry
        )
        existing_profile.tags_json = tags
        existing_profile.capability_score = score
        
        # Handle resources - replace existing ones
        if request.resources:
            # Delete existing resources for this user
            db.query(Resource).filter(Resource.user_id == user.id).delete()
            
            # Add new resources
            for resource_data in request.resources:
                resource = Resource(
                    user_id=user.id,
                    category=resource_data.category,
                    subtype=resource_data.subtype,
                    quantity=resource_data.quantity,
                    specs_json=resource_data.specs or {},
                    available=True
                )
                db.add(resource)
        
        profile = existing_profile
        db.commit()
    else:
        # Create new profile
        resources_data = [r.dict() for r in request.resources] if request.resources else []
        tags, score = tagger.generate_tags_and_score(
            education_level=request.education_level,
            skills=resolved_skills,
            free_text=request.free_text or "",
            availability="available",
            resources=resources_data,
            industry=request.industry
        )
        
        profile = Profile(
            user_id=user.id,
            education_level=request.education_level,
            industry=request.industry,
            skills=resolved_skills,
            free_text=request.free_text,
            skill_levels=request.skill_levels,
            availability="available",
            capability_score=score,
            tags_json=tags,
            status="available"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # Handle resources for new profile
        if request.resources:
            for resource_data in request.resources:
                resource = Resource(
                    user_id=user.id,
                    category=resource_data.category,
                    subtype=resource_data.subtype,
                    quantity=resource_data.quantity,
                    specs_json=resource_data.specs or {},
                    available=True
                )
                db.add(resource)
            db.commit()
    
    # Log the action
    audit.log_action(
        actor=user_id_hash,
        action="submit_profile",
        entity="profile",
        entity_id=profile.id,
        details={
            "submission_id": request.submission_id,
            "capability_score": score,
            "tags": tags
        },
        db=db
    )
    
    return {
        "message": "Profile submitted successfully",
        "submission_id": request.submission_id,
        "profile_id": profile.id,
        "capability_score": score,
        "tags": tags
    }

@router.get("/tags")
async def get_available_tags():
    """Get list of available tags for the frontend"""
    return {
        "tags": tagger.get_available_tags(),
        "education_levels": tagger.get_education_levels()
    }
