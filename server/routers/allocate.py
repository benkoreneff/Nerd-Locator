"""
Allocation router - handles civilian allocation and requests
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_db
from models import User, Profile, Request, Allocation
from schemas import RequestCreateRequest, RequestResponse, AllocateRequest, AllocationResponse
from auth import require_authority, get_user_id_hash
from services.audit import audit

router = APIRouter()

@router.post("/requests", response_model=RequestResponse)
async def create_request(
    request: RequestCreateRequest,
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Create a request for information or allocation"""
    
    # Verify user exists
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civilian not found"
        )
    
    # Create request
    new_request = Request(
        authority_id=current_user["national_id_hash"],
        type=request.type,
        user_id=request.user_id,
        message=request.message,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    # Log the action
    audit.log_request(
        actor=current_user["national_id_hash"],
        request_id=new_request.id,
        request_type=request.type,
        user_id=request.user_id,
        message=request.message,
        db=db
    )
    
    return RequestResponse(
        id=new_request.id,
        authority_id=new_request.authority_id,
        type=new_request.type,
        user_id=new_request.user_id,
        message=new_request.message,
        status=new_request.status,
        created_at=new_request.created_at,
        updated_at=new_request.updated_at
    )

@router.post("/allocate", response_model=AllocationResponse)
async def allocate_civilian(
    allocation: AllocateRequest,
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """Allocate civilian to a mission"""
    
    # Verify user exists
    user = db.query(User).filter(User.id == allocation.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Civilian not found"
        )
    
    # Get profile
    profile = db.query(Profile).filter(Profile.user_id == allocation.user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Check if already allocated
    if profile.status == "allocated":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Civilian is already allocated"
        )
    
    # Verify resource exists if provided
    if allocation.resource_id:
        from models import Resource
        resource = db.query(Resource).filter(Resource.id == allocation.resource_id).first()
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found"
            )
    
    # Create allocation
    new_allocation = Allocation(
        user_id=allocation.user_id,
        resource_id=allocation.resource_id,
        mission_code=allocation.mission_code,
        status="active"
    )
    db.add(new_allocation)
    
    # Update profile status
    profile.status = "allocated"
    
    db.commit()
    db.refresh(new_allocation)
    
    # Log the allocation
    audit.log_allocation(
        actor=current_user["national_id_hash"],
        user_id=allocation.user_id,
        mission_code=allocation.mission_code,
        allocation_id=new_allocation.id,
        db=db
    )
    
    return AllocationResponse(
        id=new_allocation.id,
        user_id=new_allocation.user_id,
        resource_id=new_allocation.resource_id,
        mission_code=new_allocation.mission_code,
        status=new_allocation.status,
        created_at=new_allocation.created_at if new_allocation.created_at else None
    )

@router.get("/requests", response_model=list[RequestResponse])
async def list_requests(
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """List all requests created by current authority"""
    
    requests = db.query(Request).filter(
        Request.authority_id == current_user["national_id_hash"]
    ).order_by(Request.created_at.desc()).all()
    
    return [
        RequestResponse(
            id=req.id,
            authority_id=req.authority_id,
            type=req.type,
            user_id=req.user_id,
            message=req.message,
            status=req.status,
            created_at=req.created_at,
            updated_at=req.updated_at
        ) for req in requests
    ]

@router.get("/allocations", response_model=list[AllocationResponse])
async def list_allocations(
    current_user: dict = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """List all active allocations"""
    
    # In a real system, you'd filter by authority
    # For demo, show all active allocations
    allocations = db.query(Allocation).filter(
        Allocation.status == "active"
    ).order_by(Allocation.created_at.desc()).all()
    
    return [
        AllocationResponse(
            id=alloc.id,
            user_id=alloc.user_id,
            resource_id=alloc.resource_id,
            mission_code=alloc.mission_code,
            status=alloc.status,
            created_at=alloc.created_at if alloc.created_at else None
        ) for alloc in allocations
    ]
