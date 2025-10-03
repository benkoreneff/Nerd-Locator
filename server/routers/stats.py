"""
Stats router - provides heatmap and statistics data
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from db import get_db
from models import User, Profile
from schemas import HeatmapResponse, HeatmapPoint
from auth import require_authority

router = APIRouter()

@router.get("/heatmap", response_model=HeatmapResponse)
async def get_heatmap_data(
    bbox: Optional[str] = Query(None, description="Comma-separated: min_lat,min_lon,max_lat,max_lon"),
    tags: Optional[str] = Query(None, description="Comma-separated tag list"),
    min_score: Optional[float] = Query(None, ge=0, le=100),
    availability: Optional[str] = Query(None, regex="^(immediate|24h|48h|unavailable)$"),
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Get heatmap data for civilian locations"""
    
    # Build query similar to search
    query = db.query(User.lat, User.lon, Profile.capability_score).join(
        Profile, User.id == Profile.user_id
    )
    
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
            pass  # Ignore invalid bbox
    
    # Parse tags if provided
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        for tag in tag_list:
            query = query.filter(Profile.tags_json.contains([tag]))
    
    # Filter by minimum score
    if min_score is not None:
        query = query.filter(Profile.capability_score >= min_score)
    
    # Filter by availability
    if availability:
        query = query.filter(Profile.availability == availability)
    
    # Only include available civilians
    query = query.filter(Profile.status == "available")
    
    # Get results
    results = query.all()
    
    # Convert to heatmap points
    points = []
    bounds = None
    
    if results:
        lats = [r.lat for r in results]
        lons = [r.lon for r in results]
        
        # Calculate bounds
        bounds = [
            min(lats), min(lons),
            max(lats), max(lons)
        ]
        
        # Create points with weights based on capability score
        for lat, lon, score in results:
            # Normalize score to weight (0.1 to 1.0)
            weight = max(0.1, min(1.0, score / 100.0))
            
            points.append(HeatmapPoint(
                lat=lat,
                lon=lon,
                weight=weight
            ))
    
    return HeatmapResponse(
        points=points,
        bounds=bounds
    )

@router.get("/summary")
async def get_summary_stats(
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Get summary statistics"""
    
    # Count total civilians
    total_civilians = db.query(Profile).count()
    
    # Count by availability
    availability_stats = {}
    for availability in ["immediate", "24h", "48h", "unavailable"]:
        count = db.query(Profile).filter(Profile.availability == availability).count()
        availability_stats[availability] = count
    
    # Count by status
    status_stats = {}
    for status in ["available", "requested", "allocated", "unavailable"]:
        count = db.query(Profile).filter(Profile.status == status).count()
        status_stats[status] = count
    
    # Average capability score
    avg_score = db.query(func.avg(Profile.capability_score)).scalar() or 0
    
    # Count by education level
    education_stats = {}
    education_levels = db.query(Profile.education_level).distinct().all()
    for (level,) in education_levels:
        count = db.query(Profile).filter(Profile.education_level == level).count()
        education_stats[level] = count
    
    return {
        "total_civilians": total_civilians,
        "availability_breakdown": availability_stats,
        "status_breakdown": status_stats,
        "average_capability_score": round(avg_score, 1),
        "education_breakdown": education_stats
    }
