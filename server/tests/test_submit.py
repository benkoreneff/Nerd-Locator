"""
Tests for civilian submission functionality
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from main import app
from db import get_db, engine
from models import Base, User, Profile

client = TestClient(app)

@pytest.fixture
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=engine)
    db = Session(bind=engine)
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_submit_profile_idempotency(db_session):
    """Test that submitting the same profile multiple times doesn't create duplicates"""
    
    # Mock the database dependency
    def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Submit profile first time
    response1 = client.post(
        "/civilian/submit",
        json={
            "submission_id": "test-submission-1",
            "education_level": "bachelors",
            "skills": ["programming", "communication"],
            "free_text": "Software developer with communication skills",
            "availability": "immediate",
            "consent": True
        },
        headers={
            "X-Demo-User": "civilian1",
            "X-Role": "civilian"
        }
    )
    
    assert response1.status_code == 200
    data1 = response1.json()
    assert "profile_id" in data1
    
    # Submit same profile again with same submission_id
    response2 = client.post(
        "/civilian/submit",
        json={
            "submission_id": "test-submission-1",
            "education_level": "bachelors",
            "skills": ["programming", "communication"],
            "free_text": "Software developer with communication skills",
            "availability": "immediate",
            "consent": True
        },
        headers={
            "X-Demo-User": "civilian1",
            "X-Role": "civilian"
        }
    )
    
    assert response2.status_code == 200
    data2 = response2.json()
    
    # Should be the same profile (updated, not duplicated)
    assert data1["profile_id"] == data2["profile_id"]
    
    # Verify only one profile exists in database
    profiles = db_session.query(Profile).filter(Profile.user_id == 1).all()
    assert len(profiles) == 1

def test_search_filters(db_session):
    """Test search functionality with filters"""
    
    # Mock the database dependency
    def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    # First, create some test data
    from datetime import datetime
    test_user = User(
        national_id_hash="hash_test_user",
        full_name="Test User",
        dob=datetime(1990, 1, 1),
        address="Test Address",
        lat=60.1699,
        lon=24.9384
    )
    db_session.add(test_user)
    db_session.commit()
    db_session.refresh(test_user)
    
    test_profile = Profile(
        user_id=test_user.id,
        education_level="masters",
        skills=["medical", "emergency"],
        availability="immediate",
        capability_score=85.0,
        tags_json=["medical"],
        status="available"
    )
    db_session.add(test_profile)
    db_session.commit()
    
    # Test search without filters
    response = client.get(
        "/search/",
        headers={
            "X-Demo-User": "authority1",
            "X-Role": "authority"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) >= 1
    
    # Test search with score filter
    response = client.get(
        "/search/?min_score=80",
        headers={
            "X-Demo-User": "authority1",
            "X-Role": "authority"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    # Should only return profiles with score >= 80
    for result in data["results"]:
        assert result["capability_score"] >= 80
    
    # Test search with availability filter
    response = client.get(
        "/search/?availability=immediate",
        headers={
            "X-Demo-User": "authority1",
            "X-Role": "authority"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    # Should only return profiles with immediate availability
    for result in data["results"]:
        assert result["availability"] == "immediate"

def test_unauthorized_access():
    """Test that unauthorized users cannot access protected endpoints"""
    
    # Try to access civilian endpoint without auth
    response = client.post("/civilian/submit", json={})
    assert response.status_code == 401
    
    # Try to access authority endpoint without auth
    response = client.get("/search/")
    assert response.status_code == 401
    
    # Try to access with wrong role
    response = client.get(
        "/search/",
        headers={
            "X-Demo-User": "civilian1",
            "X-Role": "civilian"
        }
    )
    assert response.status_code == 403
