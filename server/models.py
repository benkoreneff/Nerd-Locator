"""
Database models for Civitas
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import func as sql_func
from db import Base

class User(Base):
    """User model - stores PII that's only revealed after allocation"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    national_id_hash = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    dob = Column(DateTime, nullable=False)
    address = Column(Text, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False)
    resources = relationship("Resource", back_populates="user")
    requests = relationship("Request", back_populates="user")
    allocations = relationship("Allocation", back_populates="user")

class Profile(Base):
    """Profile model - stores civilian capabilities and availability"""
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    education_level = Column(String(100), nullable=False)
    industry = Column(String(100), nullable=True)  # Industry dropdown selection
    skills = Column(JSON, nullable=False)  # List of skills
    free_text = Column(Text, nullable=True)
    availability = Column(String(50), nullable=False)  # immediate/24h/48h/unavailable
    capability_score = Column(Float, default=0.0)
    tags_json = Column(JSON, nullable=True)  # Derived tags from rules
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    status = Column(String(50), default="available")  # available/requested/allocated/unavailable
    
    # Relationships
    user = relationship("User", back_populates="profile")

class Resource(Base):
    """Resource model - stores tools and assets from civilian submissions"""
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(100), nullable=False)  # fabrication/power/workshop/transport/drone/heavy/comms
    subtype = Column(String(100), nullable=False)  # 3d_printer/generator/van/etc
    quantity = Column(Integer, nullable=True)  # Optional quantity
    specs_json = Column(JSON, nullable=True)  # Resource specifications (key/value pairs)
    available = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="resources")
    allocations = relationship("Allocation", back_populates="resource")

class Request(Base):
    """Request model - tracks info/allocate requests from authorities"""
    __tablename__ = "requests"
    
    id = Column(Integer, primary_key=True, index=True)
    authority_id = Column(String(100), nullable=False)  # Authority identifier
    type = Column(String(20), nullable=False)  # info/allocate
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending/approved/rejected/completed
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="requests")

class Allocation(Base):
    """Allocation model - tracks civilian allocations to missions"""
    __tablename__ = "allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    mission_code = Column(String(100), nullable=False)
    status = Column(String(50), default="active")  # active/completed/cancelled
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="allocations")
    resource = relationship("Resource", back_populates="allocations")

class AuditLog(Base):
    """Audit log - tracks all actions touching PII or state changes"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    actor = Column(String(100), nullable=False)  # User or system identifier
    action = Column(String(100), nullable=False)  # create/read/update/delete/allocate
    entity = Column(String(100), nullable=False)  # user/profile/request/allocation
    entity_id = Column(Integer, nullable=False)
    ts = Column(DateTime, default=func.now())
    details_json = Column(JSON, nullable=True)  # Additional context
    
    # Index for time-based queries
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )

class Skill(Base):
    """Skill model - canonical skills with aliases"""
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    canonical = Column(Boolean, default=True)
    aliases = Column(JSON, nullable=True)  # List of alternative names
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        {"sqlite_autoincrement": True},
    )
