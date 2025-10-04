"""
Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

# Base schemas
class UserBase(BaseModel):
    full_name: str
    dob: datetime
    address: str
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)

class ProfileBase(BaseModel):
    education_level: str
    industry: Optional[str] = None
    skills: List[str]
    free_text: Optional[str] = None
    availability: str = Field(..., pattern="^(available|allocated)$")

# Request schemas
# Resource schemas
class ResourceSpec(BaseModel):
    category: str
    subtype: str
    quantity: Optional[int] = None
    specs: Optional[Dict[str, Any]] = None

# Skills schemas
class SkillSpec(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None

class CivilianSubmitRequest(BaseModel):
    submission_id: str
    education_level: str
    industry: Optional[str] = None
    skills: List[Union[str, SkillSpec]]  # Support both string and SkillSpec formats
    free_text: Optional[str] = None
    resources: Optional[List[ResourceSpec]] = None
    skill_levels: Optional[Dict[str, int]] = None  # Skill level matrix data
    consent: bool = Field(..., description="Consent to data processing")

class SearchRequest(BaseModel):
    bbox: Optional[List[float]] = Field(None, description="[min_lat, min_lon, max_lat, max_lon]")
    tags: Optional[List[str]] = None
    min_score: Optional[float] = Field(None, ge=0, le=100)
    availability: Optional[str] = Field(None, pattern="^(available|allocated)$")
    page: int = Field(1, ge=1)
    limit: int = Field(50, ge=1, le=100)

class AdvancedSearchRequest(BaseModel):
    # Location options (mutually exclusive)
    center_lat: Optional[float] = Field(None, description="Center latitude for radius search")
    center_lon: Optional[float] = Field(None, description="Center longitude for radius search")
    radius_km: Optional[float] = Field(None, ge=0.1, le=500, description="Search radius in kilometers")
    bbox: Optional[List[float]] = Field(None, description="[min_lat, min_lon, max_lat, max_lon]")
    polygon: Optional[Dict[str, Any]] = Field(None, description="GeoJSON polygon for complex areas")
    use_map_center: Optional[bool] = Field(None, description="Use current map center")
    
    # Basic filters
    status: Optional[List[str]] = Field(None, description="Filter by status (available, allocated)")
    skills: Optional[List[str]] = Field(None, description="Skill names for keyword filtering")
    
    # Advanced filters
    min_levels: Optional[Dict[str, int]] = Field(None, description="Minimum level for each skill")
    include_tags: Optional[List[str]] = Field(None, description="Tags that must be present")
    exclude_tags: Optional[List[str]] = Field(None, description="Tags that must not be present")
    
    # Legacy fields for backward compatibility
    skill_levels: Optional[Dict[str, int]] = Field(None, description="Minimum level for each skill (legacy)")
    required_skills: Optional[List[str]] = Field(None, description="Skills that must be present (legacy)")
    preferred_skills: Optional[List[str]] = Field(None, description="Skills that get bonus scoring (legacy)")
    tags: Optional[List[str]] = Field(None, description="Include/exclude tags (legacy)")
    min_capability_score: Optional[float] = Field(None, ge=0, le=100)
    
    # Pagination and sorting
    page: int = Field(1, ge=1)
    limit: int = Field(50, ge=1, le=100)
    sort: str = Field("combined", description="Sort by: distance, capability, combined")
    sort_by: str = Field("distance", description="Sort by: distance, score, combined (legacy)")

class RequestCreateRequest(BaseModel):
    type: str = Field(..., pattern="^(info|allocate)$")
    user_id: int
    message: Optional[str] = None

class AllocateRequest(BaseModel):
    user_id: int
    resource_id: Optional[int] = None
    mission_code: str

# Response schemas
class UserResponse(BaseModel):
    id: int
    full_name: Optional[str] = None  # Hidden until allocated
    dob: Optional[datetime] = None
    address: Optional[str] = None
    lat: Optional[float] = None  # Approximate location
    lon: Optional[float] = None
    created_at: Optional[datetime] = None

class ProfileResponse(BaseModel):
    id: int
    education_level: str
    industry: Optional[str] = None
    skills: List[str]
    free_text: Optional[str] = None
    availability: str
    capability_score: float
    tags_json: Optional[List[str]] = None
    skill_levels: Optional[Dict[str, int]] = None
    last_updated: Optional[datetime] = None
    status: str

class CivilianMeResponse(BaseModel):
    user: UserResponse
    profile: Optional[ProfileResponse] = None

class SearchResult(BaseModel):
    user_id: int
    education_level: str
    skills: List[str]
    availability: str
    capability_score: float
    tags: List[str]
    lat: float  # Approximate
    lon: float  # Approximate
    status: str
    skill_levels: Optional[Dict[str, int]] = None

class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    page: int
    limit: int
    search_geometry: Optional[Dict[str, Any]] = Field(None, description="GeoJSON geometry of search area")

class AdvancedSearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
    page: int
    limit: int
    search_geometry: Optional[Dict[str, Any]] = Field(None, description="GeoJSON geometry of search area")
    search_center: Optional[Dict[str, float]] = Field(None, description="Search center point")
    search_radius_km: Optional[float] = Field(None, description="Search radius in kilometers")

class DetailResponse(BaseModel):
    user: UserResponse
    profile: ProfileResponse
    pii_revealed: bool = Field(False, description="Whether PII is revealed (after allocation)")

class RequestResponse(BaseModel):
    id: int
    authority_id: str
    type: str
    user_id: int
    message: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

class AllocationResponse(BaseModel):
    id: int
    user_id: int
    resource_id: Optional[int] = None
    mission_code: str
    status: str
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class HeatmapPoint(BaseModel):
    lat: float
    lon: float
    weight: float

class HeatmapResponse(BaseModel):
    points: List[HeatmapPoint]
    bounds: Optional[List[float]] = None  # [min_lat, min_lon, max_lat, max_lon]

class ExportResponse(BaseModel):
    users: List[UserResponse]
    profiles: List[ProfileResponse]
    requests: List[RequestResponse]
    allocations: List[AllocationResponse]
    audit_logs: List[Dict[str, Any]]
    exported_at: datetime

# Skills schemas
class SkillResponse(BaseModel):
    id: int
    name: str
    canonical: bool

class SkillCreateRequest(BaseModel):
    name: str

class SkillSuggestResponse(BaseModel):
    results: List[SkillResponse]

# Config
class Config:
    from_attributes = True
