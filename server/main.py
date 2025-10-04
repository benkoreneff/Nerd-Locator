"""
Civitas - Main FastAPI application
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from db import engine, create_tables, get_db
from routers import civilian, search, allocate, stats, admin, skills, geocode
from auth import setup_demo_auth

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Civitas")
    create_tables()
    setup_demo_auth()
    
    # Seed canonical skills
    from routers.skills import seed_canonical_skills
    with next(get_db()) as db:
        seed_canonical_skills(db)
    
    logger.info("Database tables created, demo auth configured, and skills seeded")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Civitas")

# Create FastAPI app
app = FastAPI(
    title="Civitas",
    description="Finnish civilian-to-authority coordination tool",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(civilian.router, prefix="/civilian", tags=["civilian"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(allocate.router, prefix="/allocate", tags=["allocate"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(skills.router, prefix="/skills", tags=["skills"])
app.include_router(geocode.router, prefix="/geocode", tags=["geocode"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Civitas API", "version": "1.0.0"}

@app.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "kokonaisturvallisuus-mvp"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
