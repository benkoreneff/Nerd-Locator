"""
Search router - handles civilian search and filtering for authorities
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func

from db import get_db
from models import User, Profile
from schemas import SearchRequest, SearchResponse, SearchResult, DetailResponse
from auth import require_authority, can_reveal_pii
from services.audit import audit

router = APIRouter()

@router.get("/", response_model=SearchResponse)
async def search_civilians(
    bbox: Optional[str] = Query(None, description="Comma-separated: min_lat,min_lon,max_lat,max_lon"),
    tags: Optional[str] = Query(None, description="Comma-separated tag list"),
    min_score: Optional[float] = Query(None, ge=0, le=100),
    availability: Optional[str] = Query(None, regex="^(immediate|24h|48h|unavailable)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Search civilians with filters (returns anonymized results)"""
    
    # Build query
    query = db.query(User, Profile).join(Profile, User.id == Profile.user_id)
    
    # Parse bbox if provided
    if bbox:
        try:
            coords = [float(x.strip()) for x in bbox.split(",")]
            if len(coords) == 4:
                min_lat, min_lon, max_lat, max_lon = coords
                query = query.filter(
                    and_(
                        User.lat >= min_lat,
                        User.lat <= max_lat,
                        User.lon >= min_lon,
                        User.lon <= max_lon
                    )
                )
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid bbox format. Use: min_lat,min_lon,max_lat,max_lon"
            )
    
    # Parse tags if provided
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        # Filter by tags in JSON array
        for tag in tag_list:
            query = query.filter(Profile.tags_json.contains([tag]))
    
    # Filter by minimum score
    if min_score is not None:
        query = query.filter(Profile.capability_score >= min_score)
    
    # Filter by availability
    if availability:
        query = query.filter(Profile.availability == availability)
    
    # Only show available civilians
    query = query.filter(Profile.status == "available")
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()
    
    # Convert to response format (anonymized)
    search_results = []
    for user, profile in results:
        # Add small random offset to location for privacy
        import random
        lat_offset = random.uniform(-0.01, 0.01)  # ~1km
        lon_offset = random.uniform(-0.01, 0.01)
        
        search_results.append(SearchResult(
            user_id=user.id,
            education_level=profile.education_level,
            skills=profile.skills,
            availability=profile.availability,
            capability_score=profile.capability_score,
            tags=profile.tags_json or [],
            lat=user.lat + lat_offset,
            lon=user.lon + lon_offset,
            status=profile.status
        ))
    
    return SearchResponse(
        results=search_results,
        total=total,
        page=page,
        limit=limit
    )

@router.get("/detail/{user_id}", response_model=DetailResponse)
async def get_civilian_detail(
    user_id: int,
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Get detailed civilian information (PII revealed only after allocation)"""
    
    # Get user and profile
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civilian not found"
        )
    
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Check if PII can be revealed
    pii_revealed = can_reveal_pii(user_id, current_user)
    
    # Log PII access attempt
    audit.log_pii_access(
        actor=current_user["national_id_hash"],
        user_id=user_id,
        access_type="read",
        details={"pii_revealed": pii_revealed},
        db=db
    )
    
    # Create response with conditional PII
    user_response = UserResponse(
        id=user.id,
        full_name=user.full_name if pii_revealed else None,
        dob=user.dob.isoformat() if pii_revealed and user.dob else None,
        address=user.address if pii_revealed else None,
        lat=user.lat if pii_revealed else None,
        lon=user.lon if pii_revealed else None,
        created_at=user.created_at.isoformat()
    )
    
    profile_response = ProfileResponse(
        id=profile.id,
        education_level=profile.education_level,
        skills=profile.skills,
        free_text=profile.free_text,
        availability=profile.availability,
        capability_score=profile.capability_score,
        tags_json=profile.tags_json,
        last_updated=profile.last_updated.isoformat(),
        status=profile.status
    )
    
    return DetailResponse(
        user=user_response,
        profile=profile_response,
        pii_revealed=pii_revealed
    )
