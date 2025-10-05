"""
Search router - handles civilian search and filtering for authorities
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func

from db import get_db
from models import User, Profile
from schemas import SearchRequest, SearchResponse, SearchResult, DetailResponse, UserResponse, ProfileResponse, AdvancedSearchRequest, AdvancedSearchResponse
from auth import require_authority, can_reveal_pii
from services.audit import audit

router = APIRouter()

@router.get("/", response_model=SearchResponse)
async def search_civilians(
    bbox: Optional[str] = Query(None, description="Comma-separated: min_lat,min_lon,max_lat,max_lon"),
    tags: Optional[str] = Query(None, description="Comma-separated tag list"),
    min_score: Optional[float] = Query(None, ge=0, le=100),
    availability: Optional[str] = Query(None, pattern="^(available|allocated)$"),
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
        # Add small deterministic offset to location for privacy
        # Using user ID to ensure consistent positioning while maintaining privacy
        import hashlib
        user_hash = hashlib.md5(str(user.id).encode()).hexdigest()
        # Convert first 4 chars to deterministic offset (-0.01 to 0.01 range)
        lat_offset = (int(user_hash[:4], 16) / 65535.0 - 0.5) * 0.02  # ~1km
        lon_offset = (int(user_hash[4:8], 16) / 65535.0 - 0.5) * 0.02
        
        search_results.append(SearchResult(
            user_id=user.id,
            education_level=profile.education_level,
            skills=profile.skills,
            availability=profile.availability,
            capability_score=profile.capability_score,
            tags=profile.tags_json or [],
            lat=user.lat + lat_offset,
            lon=user.lon + lon_offset,
            status=profile.status,
            skill_levels=profile.skill_levels
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
    db: Session = Depends(get_db),
    # Optional search context parameters for query-relevant scoring
    skills: List[str] = Query(None),
    include_tags: List[str] = Query(None),
    search_query: str = Query(None)
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
        created_at=user.created_at.isoformat() if user.created_at else None
    )
    
    # Calculate capability score - use query-relevant if search context provided
    capability_score = profile.capability_score  # Default to static score
    
    if skills or include_tags or search_query:
        # Use query-relevant scoring when search context is available
        from services.tagger import tagger
        
        civilian_data = {
            "education_level": profile.education_level,
            "skills": profile.skills,
            "free_text": profile.free_text or "",
            "availability": profile.availability,
            "industry": profile.industry,
            "tags": profile.tags_json or []
        }
        
        # Build search query from parameters
        search_query_parts = []
        if skills:
            search_query_parts.extend(skills)
        if include_tags:
            search_query_parts.extend(include_tags)
        if search_query:
            search_query_parts.append(search_query)
        combined_search_query = " ".join(search_query_parts)
        
        capability_score = tagger.calculate_query_relevant_score(
            civilian_data=civilian_data,
            search_query=combined_search_query,
            skills_query=skills or [],
            include_tags=include_tags or []
        )
    
    profile_response = ProfileResponse(
        id=profile.id,
        education_level=profile.education_level,
        skills=profile.skills,
        free_text=profile.free_text,
        availability=profile.availability,
        capability_score=capability_score,
        tags_json=profile.tags_json,
        skill_levels=profile.skill_levels,
        last_updated=profile.last_updated.isoformat() if profile.last_updated else None,
        status=profile.status
    )
    
    return DetailResponse(
        user=user_response,
        profile=profile_response,
        pii_revealed=pii_revealed
    )

@router.post("/advanced", response_model=AdvancedSearchResponse)
async def search_advanced(
    request: AdvancedSearchRequest,
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Advanced search with location-based filtering and skill level requirements"""
    
    # Build base query
    query = db.query(User, Profile).join(Profile, User.id == Profile.user_id)
    
    # Location filtering
    search_geometry = None
    search_center = None
    search_radius_km = None
    
    if request.center_lat and request.center_lon and request.radius_km:
        # Radius-based search
        import math
        
        # Convert radius from km to degrees (approximate)
        lat_degree = request.radius_km / 111.0  # 1 degree latitude ≈ 111 km
        lon_degree = request.radius_km / (111.0 * math.cos(math.radians(request.center_lat)))
        
        # Create bounding box for radius search
        min_lat = request.center_lat - lat_degree
        max_lat = request.center_lat + lat_degree
        min_lon = request.center_lon - lon_degree
        max_lon = request.center_lon + lon_degree
        
        query = query.filter(
            and_(
                User.lat.between(min_lat, max_lat),
                User.lon.between(min_lon, max_lon)
            )
        )
        
        # Create search geometry (circle approximation as polygon)
        search_geometry = {
            "type": "Polygon",
            "coordinates": [[
                [request.center_lon - lon_degree, request.center_lat - lat_degree],
                [request.center_lon + lon_degree, request.center_lat - lat_degree],
                [request.center_lon + lon_degree, request.center_lat + lat_degree],
                [request.center_lon - lon_degree, request.center_lat + lat_degree],
                [request.center_lon - lon_degree, request.center_lat - lat_degree]
            ]]
        }
        search_center = {"lat": request.center_lat, "lon": request.center_lon}
        search_radius_km = request.radius_km
        
    elif request.bbox and len(request.bbox) == 4:
        # Bounding box search
        min_lat, min_lon, max_lat, max_lon = request.bbox
        query = query.filter(
            and_(
                User.lat.between(min_lat, max_lat),
                User.lon.between(min_lon, max_lon)
            )
        )
        
        search_geometry = {
            "type": "Polygon",
            "coordinates": [[
                [min_lon, min_lat],
                [max_lon, min_lat],
                [max_lon, max_lat],
                [min_lon, max_lat],
                [min_lon, min_lat]
            ]]
        }
    
    # Status filtering
    if request.status:
        query = query.filter(Profile.status.in_(request.status))
    
    # Capability score filtering
    if request.min_capability_score is not None:
        query = query.filter(Profile.capability_score >= request.min_capability_score)
    
    # Skills filtering (keyword-based)
    if request.skills:
        skill_conditions = []
        for skill in request.skills:
            # Search in skills field (JSON array) using LIKE for partial matching
            # and also search in free_text
            skill_conditions.append(
                or_(
                    Profile.skills.like(f'%{skill}%'),
                    Profile.free_text.ilike(f'%{skill}%')
                )
            )
        if skill_conditions:
            query = query.filter(or_(*skill_conditions))
    
    # Skill level filtering (new format)
    skill_levels = request.min_levels or request.skill_levels
    if skill_levels:
        for skill_name, min_level in skill_levels.items():
            # Filter by minimum skill level (stored as JSON in skill_levels field)
            # Only include profiles that have this skill AND meet the minimum level
            query = query.filter(
                and_(
                    func.json_extract(Profile.skill_levels, f'$.{skill_name}').isnot(None),
                    func.json_extract(Profile.skill_levels, f'$.{skill_name}') >= min_level
                )
            )
    
    # Required skills filtering (legacy)
    if request.required_skills:
        for skill in request.required_skills:
            query = query.filter(
                func.json_extract(Profile.skill_levels, f'$.{skill}').isnot(None)
            )
    
    # Tag filtering (new format)
    include_tags = request.include_tags or []
    
    # Include tags (must have)
    if include_tags:
        tag_conditions = []
        for tag in include_tags:
            # Check if tag exists in the JSON array using JSON_CONTAINS or LIKE
            tag_conditions.append(
                Profile.tags_json.like(f'%"{tag}"%')
            )
        if tag_conditions:
            query = query.filter(and_(*tag_conditions))  # All tags must be present
    
    # Legacy tag filtering
    if request.tags:
        tag_conditions = []
        for tag in request.tags:
            # Check if tag exists in the JSON array using LIKE
            tag_conditions.append(
                Profile.tags_json.like(f'%"{tag}"%')
            )
        if tag_conditions:
            query = query.filter(and_(*tag_conditions))  # All tags must be present
    
    # Get total count
    total = query.count()
    
    # Pagination
    offset = (request.page - 1) * request.limit
    results = query.offset(offset).limit(request.limit).all()
    
    # Convert to response format (anonymized) with query-relevant scoring
    from services.tagger import tagger
    
    search_results = []
    for user, profile in results:
        # Add small deterministic offset to location for privacy
        import hashlib
        user_hash = hashlib.md5(str(user.id).encode()).hexdigest()
        lat_offset = (int(user_hash[:4], 16) / 65535.0 - 0.5) * 0.02
        lon_offset = (int(user_hash[4:8], 16) / 65535.0 - 0.5) * 0.02
        
        # Use static capability score by default, or query-relevant if search context provided
        capability_score = profile.capability_score
        
        # Only use query-relevant scoring if there's actual search context
        if (request.skills and len(request.skills) > 0) or (request.include_tags and len(request.include_tags) > 0):
            civilian_data = {
                "education_level": profile.education_level,
                "skills": profile.skills,
                "free_text": profile.free_text or "",
                "availability": profile.availability,
                "industry": profile.industry,
                "tags": profile.tags_json or []
            }
            
            # Build search query from request parameters
            search_query_parts = []
            if request.skills:
                search_query_parts.extend(request.skills)
            if request.include_tags:
                search_query_parts.extend(request.include_tags)
            search_query = " ".join(search_query_parts)
            
            # Calculate query-relevant score
            capability_score = tagger.calculate_query_relevant_score(
                civilian_data=civilian_data,
                search_query=search_query,
                skills_query=request.skills or [],
                include_tags=request.include_tags or []
            )
        
        search_results.append(SearchResult(
            user_id=user.id,
            education_level=profile.education_level,
            skills=profile.skills,
            availability=profile.availability,
            capability_score=capability_score,  # Use static score by default, query-relevant when context provided
            tags=profile.tags_json or [],
            lat=user.lat + lat_offset,
            lon=user.lon + lon_offset,
            status=profile.status,
            skill_levels=profile.skill_levels
        ))
    
        # Sort results if needed
        sort_method = request.sort or request.sort_by or "combined"
        
        if sort_method == "capability" or sort_method == "score":
            search_results.sort(key=lambda x: x.capability_score, reverse=True)
        elif sort_method == "distance" and search_center:
            # Sort by distance from search center
            import math
            def distance_from_center(result):
                lat_diff = result.lat - search_center["lat"]
                lon_diff = result.lon - search_center["lon"]
                return math.sqrt(lat_diff**2 + lon_diff**2) * 111.0
            search_results.sort(key=distance_from_center)
        elif sort_method == "combined" and search_center:
            # Sort by combined score (distance + capability)
            import math
            def combined_score(result):
                lat_diff = result.lat - search_center["lat"]
                lon_diff = result.lon - search_center["lon"]
                distance_km = math.sqrt(lat_diff**2 + lon_diff**2) * 111.0
                # Normalize distance (0-100km = 100-0 score) and capability (0-100)
                distance_score = max(0, 100 - distance_km)
                combined = (distance_score * 0.3) + (result.capability_score * 0.7)
                return combined
            search_results.sort(key=combined_score, reverse=True)
    
    # Log search for audit
    audit.log_action(
        actor=current_user["national_id_hash"],
        action="advanced_search",
        entity="search",
        entity_id=0,  # Use 0 for search operations
        details={
            "filters": request.dict(exclude_unset=True),
            "result_count": len(search_results)
        }
    )
    
    return AdvancedSearchResponse(
        results=search_results,
        total=total,
        page=request.page,
        limit=request.limit,
        search_geometry=search_geometry,
        search_center=search_center,
        search_radius_km=search_radius_km
    )

@router.get("/tags/suggest")
async def suggest_tags(
    q: str = Query("", description="Tag search query"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """
    Suggest tags based on existing profile tags
    """
    # Get all unique tags from profiles
    query = db.query(Profile.tags_json).filter(Profile.tags_json.isnot(None))
    results = query.all()
    
    # Extract and flatten all tags
    all_tags = set()
    for result in results:
        if result.tags_json:
            all_tags.update(result.tags_json)
    
    # Filter tags based on query
    if q:
        filtered_tags = [tag for tag in all_tags if q.lower() in tag.lower()]
    else:
        filtered_tags = list(all_tags)
    
    # Sort and limit results
    filtered_tags.sort()
    return filtered_tags[:limit]
