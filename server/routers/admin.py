"""
Admin router - handles data export and seeding
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import text

from db import get_db
from models import User, Profile, Request, Allocation, AuditLog
from schemas import ExportResponse, UserResponse, ProfileResponse, RequestResponse, AllocationResponse
from auth import require_authority

router = APIRouter()

@router.get("/export.json", response_model=ExportResponse)
async def export_json(
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Export all data as JSON"""
    
    # Get all data
    users = db.query(User).all()
    profiles = db.query(Profile).all()
    requests = db.query(Request).all()
    allocations = db.query(Allocation).all()
    audit_logs = db.query(AuditLog).all()
    
    # Convert to response format
    user_responses = [UserResponse.model_validate(user) for user in users]
    profile_responses = [ProfileResponse.model_validate(profile) for profile in profiles]
    request_responses = [RequestResponse.model_validate(req) for req in requests]
    allocation_responses = [AllocationResponse.model_validate(alloc) for alloc in allocations]
    
    # Convert audit logs to dict format
    audit_log_dicts = []
    for log in audit_logs:
        audit_log_dicts.append({
            "id": log.id,
            "actor": log.actor,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "ts": log.ts.isoformat(),
            "details_json": log.details_json
        })
    
    return ExportResponse(
        users=user_responses,
        profiles=profile_responses,
        requests=request_responses,
        allocations=allocation_responses,
        audit_logs=audit_log_dicts,
        exported_at=datetime.utcnow()
    )

@router.get("/export.csv")
async def export_csv(
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Export data as CSV"""
    
    # Get all profiles with user data
    results = db.query(User, Profile).join(Profile, User.id == Profile.user_id).all()
    
    # Create CSV content
    csv_content = "user_id,full_name,education_level,availability,capability_score,tags,lat,lon,status\n"
    
    for user, profile in results:
        # Escape CSV values
        def escape_csv(value):
            if value is None:
                return ""
            value = str(value)
            if "," in value or '"' in value or "\n" in value:
                return f'"{value.replace(chr(34), chr(34)+chr(34))}"'
            return value
        
        tags_str = ",".join(profile.tags_json or [])
        
        csv_content += f"{user.id},{escape_csv(user.full_name)},{escape_csv(profile.education_level)},{escape_csv(profile.availability)},{profile.capability_score},{escape_csv(tags_str)},{user.lat},{user.lon},{escape_csv(profile.status)}\n"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=kokonaisturvallisuus_export.csv"}
    )

@router.post("/seed")
async def seed_data(
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Load seed data for demo purposes"""
    
    # Check if data already exists
    existing_users = db.query(User).count()
    if existing_users > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database already contains data. Clear it first if you want to reseed."
        )
    
    # Execute seed SQL
    try:
        with open("seed.sql", "r") as f:
            seed_sql = f.read()
        
        # Split by semicolon and execute each statement
        statements = [stmt.strip() for stmt in seed_sql.split(";") if stmt.strip()]
        for statement in statements:
            db.execute(text(statement))
        
        db.commit()
        
        return {"message": "Seed data loaded successfully"}
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="seed.sql file not found"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading seed data: {str(e)}"
        )

@router.delete("/clear")
async def clear_data(
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Clear all data (demo purposes only)"""
    
    # Delete in reverse order due to foreign keys
    db.query(AuditLog).delete()
    db.query(Allocation).delete()
    db.query(Request).delete()
    db.query(Profile).delete()
    db.query(User).delete()
    
    db.commit()
    
    return {"message": "All data cleared successfully"}
