"""
Authentication and authorization for Kokonaisturvallisuus MVP
"""
import os
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Demo mode configuration
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

# Mock user database for demo
DEMO_USERS = {
    "civilian1": {
        "national_id_hash": "hash_civilian1",
        "full_name": "Matti Virtanen",
        "dob": "1985-03-15",
        "address": "Mannerheimintie 1, 00100 Helsinki",
        "lat": 60.1699,
        "lon": 24.9384,
        "role": "civilian"
    },
    "civilian2": {
        "national_id_hash": "hash_civilian2", 
        "full_name": "Liisa Korhonen",
        "dob": "1990-07-22",
        "address": "Unioninkatu 25, 00170 Helsinki",
        "lat": 60.1719,
        "lon": 24.9414,
        "role": "civilian"
    },
    "authority1": {
        "national_id_hash": "hash_authority1",
        "full_name": "Pekka Salminen",
        "dob": "1978-11-08", 
        "address": "Poliisilaitoksenkatu 10, 00530 Helsinki",
        "lat": 60.1881,
        "lon": 24.9079,
        "role": "authority"
    }
}

def setup_demo_auth():
    """Setup demo authentication configuration"""
    if DEMO_MODE:
        print("🔓 Demo mode enabled - using mock authentication")
    else:
        print("🔒 Production mode - real authentication required")

def get_current_user(
    x_demo_user: Optional[str] = Header(None, alias="X-Demo-User"),
    x_role: Optional[str] = Header(None, alias="X-Role")
) -> Dict[str, Any]:
    """Get current user from headers (demo mode) or JWT token"""
    
    if not DEMO_MODE:
        # In production, implement real JWT/OIDC authentication
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Real authentication not implemented yet"
        )
    
    # Demo mode - get user from headers
    if not x_demo_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-Demo-User header required in demo mode"
        )
    
    if x_demo_user not in DEMO_USERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unknown demo user: {x_demo_user}"
        )
    
    user_data = DEMO_USERS[x_demo_user].copy()
    
    # Override role if provided in header
    if x_role:
        user_data["role"] = x_role
    
    return user_data

def require_role(required_role: str):
    """Dependency to require specific role"""
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        if current_user.get("role") != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' required"
            )
        return current_user
    
    return role_checker

def require_civilian(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Require civilian role"""
    if current_user.get("role") != "civilian":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Civilian role required"
        )
    return current_user

def require_authority(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Require authority role"""
    if current_user.get("role") != "authority":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authority role required"
        )
    return current_user

def get_user_id_hash(current_user: Dict[str, Any] = Depends(get_current_user)) -> str:
    """Get current user's national ID hash"""
    return current_user["national_id_hash"]

def can_reveal_pii(user_id: int, current_user: Dict[str, Any] = Depends(get_current_user)) -> bool:
    """Check if current user can reveal PII for given user_id"""
    # Authorities can reveal PII only after allocation
    if current_user.get("role") == "authority":
        # Check if user is allocated (has an active allocation)
        from db import get_db_session
        from models import Allocation
        
        with get_db_session() as db:
            allocation = db.query(Allocation).filter(
                Allocation.user_id == user_id,
                Allocation.status == "active"
            ).first()
            return allocation is not None
    
    # Users can see their own PII
    if current_user.get("national_id_hash") == f"hash_civilian{user_id}":
        return True
    
    return False

def log_audit_action(
    actor: str,
    action: str, 
    entity: str,
    entity_id: int,
    details: Optional[Dict[str, Any]] = None
):
    """Log audit action to database"""
    # This will be implemented in the audit service
    pass
