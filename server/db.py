"""
Database configuration and session management
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kokonaisturva.db")

# Create engine with SQLite optimizations
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

def create_tables():
    """Create all database tables"""
    # Enable WAL mode for SQLite
    if "sqlite" in DATABASE_URL:
        with engine.connect() as conn:
            conn.execute(text("PRAGMA journal_mode=WAL"))
            conn.execute(text("PRAGMA foreign_keys=ON"))
            conn.execute(text("PRAGMA synchronous=NORMAL"))
            conn.execute(text("PRAGMA cache_size=1000"))
            conn.execute(text("PRAGMA temp_store=MEMORY"))
    
    # Import all models to ensure they're registered
    from models import User, Profile, Resource, Request, Allocation, AuditLog
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create indexes
    with engine.connect() as conn:
        # Spatial indexes for location-based queries
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_user_location 
            ON users(lat, lon)
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_profile_score 
            ON profiles(capability_score)
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_profile_updated 
            ON profiles(last_updated)
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_request_status 
            ON requests(status)
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_allocation_status 
            ON allocations(status)
        """))

def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_session():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
