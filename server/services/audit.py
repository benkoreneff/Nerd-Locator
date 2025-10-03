"""
Audit logging service for tracking PII access and state changes
"""
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from models import AuditLog
from db import get_db_session

class AuditService:
    """Service for audit logging"""
    
    @staticmethod
    def log_action(
        actor: str,
        action: str,
        entity: str,
        entity_id: int,
        details: Optional[Dict[str, Any]] = None,
        db: Optional[Session] = None
    ):
        """Log an audit action"""
        
        if db:
            # Use provided session
            audit_log = AuditLog(
                actor=actor,
                action=action,
                entity=entity,
                entity_id=entity_id,
                details_json=details or {}
            )
            db.add(audit_log)
            db.flush()
        else:
            # Create new session
            with get_db_session() as db:
                audit_log = AuditLog(
                    actor=actor,
                    action=action,
                    entity=entity,
                    entity_id=entity_id,
                    details_json=details or {}
                )
                db.add(audit_log)
                db.commit()
    
    @staticmethod
    def log_pii_access(
        actor: str,
        user_id: int,
        access_type: str,  # "read" or "reveal"
        details: Optional[Dict[str, Any]] = None,
        db: Optional[Session] = None
    ):
        """Log PII access"""
        AuditService.log_action(
            actor=actor,
            action=access_type,
            entity="user_pii",
            entity_id=user_id,
            details=details,
            db=db
        )
    
    @staticmethod
    def log_allocation(
        actor: str,
        user_id: int,
        mission_code: str,
        allocation_id: Optional[int] = None,
        db: Optional[Session] = None
    ):
        """Log civilian allocation"""
        AuditService.log_action(
            actor=actor,
            action="allocate",
            entity="allocation",
            entity_id=allocation_id or user_id,
            details={
                "user_id": user_id,
                "mission_code": mission_code,
                "timestamp": datetime.utcnow().isoformat()
            },
            db=db
        )
    
    @staticmethod
    def log_request(
        actor: str,
        request_id: int,
        request_type: str,
        user_id: int,
        message: Optional[str] = None,
        db: Optional[Session] = None
    ):
        """Log request creation"""
        AuditService.log_action(
            actor=actor,
            action="create_request",
            entity="request",
            entity_id=request_id,
            details={
                "request_type": request_type,
                "target_user_id": user_id,
                "message": message,
                "timestamp": datetime.utcnow().isoformat()
            },
            db=db
        )

# Global instance
audit = AuditService()
