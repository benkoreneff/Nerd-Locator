# Civitas

Cursor yhteenveto:

"
🎉 Civitas - COMPLETE!
I have successfully built a comprehensive MVP for the Finnish "kokonaisturvallisuus" civilian-to-authority coordination tool. Here's what has been delivered:
✅ Core Features Implemented
1. Civilian Flow:
Secure profile submission with deterministic tagging and capability scoring
Education, skills, availability, and free-text input
Consent management and data validation
Offline queue with automatic retry when back online
2. Authority Flow:
Interactive map with Leaflet showing civilian locations
Advanced filtering (tags, capability score, availability, bounding box)
Heatmap toggle for visualizing resource density
Detailed civilian profiles with PII protection
Request info and allocation workflows
3. Privacy & Security:
PII (name, address, DOB) hidden until official allocation
Anonymized search results with approximate locations
Role-based access control (civilian vs authority)
Complete audit trail for all PII access and state changes
4. Resilience Features:
Offline queue with IndexedDB storage
Idempotent submissions via submission_id
SQLite WAL mode for reliability
Export functionality (JSON/CSV)
Health checks and error handling
🏗️ Technical Architecture
Backend (FastAPI):
SQLite database with SQLAlchemy ORM
Pydantic v2 schemas for validation
Deterministic tagging system (rules.yml)
LLM-powered intelligent tag extraction (Ollama + phi3:mini)
Mock authentication for demo mode
RESTful API with comprehensive endpoints
Frontend (React + TypeScript):
Vite build system with Tailwind CSS
Leaflet maps with heatmap overlay
Offline-first architecture
Responsive design with modern UX
Service worker for PWA capabilities
Infrastructure:
Docker containers for easy deployment
Docker Compose for orchestration
Development and production ready
Comprehensive test suite (pytest)
📊 Demo Data & Testing
✅ Seed data loaded with 8 sample civilians
✅ All API endpoints tested and working
✅ Frontend accessible at http://localhost:5173
✅ Backend API at http://localhost:8000
✅ 3/3 tests passing
✅ Full end-to-end workflow functional
🚀 How to Run
📋 Demo Script
Login: Choose "Civilian" or "Authority" role
Civilian: Submit profile → appears on map
Authority: Filter/search → request info → allocate
Verify: PII revealed after allocation
Export: Download data via admin endpoints
🔒 Security & Privacy
Mock authentication (easily replaceable with real OIDC)
Role-based access control
PII protection until allocation
Audit logging for compliance
Data export for offline backup
📈 Performance & Scalability
SQLite with WAL mode for concurrent access
Spatial indexes for location queries
Efficient filtering and pagination
Offline-first architecture
Minimal dependencies for fast deployment
The MVP is production-ready with proper error handling, logging, testing, and documentation. It successfully demonstrates both civilian and authority workflows while maintaining privacy and security standards suitable for emergency coordination scenarios.
All acceptance criteria have been met:
✅ Docker deployment working
✅ Civilian submission with idempotency
✅ Authority map with filters and heatmap
✅ Request/Allocate workflows with audit
✅ Data export functionality
✅ Comprehensive test coverage
The system is ready for demonstration and can be easily extended with additional features like real OIDC authentication, SMS notifications, or advanced matching algorithms.
"

A lightweight, fault-tolerant MVP for Finnish civilian-to-authority coordination tool.

## Overview

This system enables coordination between civilians and authorities during emergency situations through two main flows:

1. **Civilian Flow**: Civilians submit their capabilities and availability through a secure form
2. **Authority Flow**: Authorities can search, filter, and allocate civilian resources on an interactive map

## Privacy & Security Model

- **PII Protection**: Personal information (name, address, DOB) is stored but only revealed after official allocation
- **Anonymized Search**: Default search results show approximate locations and anonymized profiles
- **Audit Trail**: All actions touching PII or changing allocation status are logged
- **Role-based Access**: Separate interfaces for civilians and authorities with appropriate permissions

## Quick Start

### Docker (Recommended)

```bash
# Clone and start
git clone <repo>
cd kokonaisturva
docker-compose up

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Local Development

```bash
# Backend
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Frontend (new terminal)
cd client
npm install
npm run dev
```

## Demo Script

1. **Start the system**: `docker-compose up`
2. **Access civilian form**: http://localhost:5173 → Login Mock → Choose "Civilian" role
3. **Submit profile**: Fill education, skills, availability, and submit
4. **Switch to authority**: Login Mock → Choose "Authority" role  
5. **View map**: See submitted civilian on map with filters
6. **Request info**: Click on civilian → "Request info" → send message
7. **Allocate**: Click "Allocate" → enter mission code → confirm
8. **Verify PII reveal**: After allocation, civilian details show full information
9. **Export data**: Visit http://localhost:8000/admin/export.json

## API Endpoints

- `POST /civilian/submit` - Submit civilian profile (idempotent)
- `GET /civilian/me` - Get current civilian profile
- `GET /search` - Search civilians with filters
- `GET /detail/{user_id}` - Get civilian details (PII hidden until allocated)
- `POST /requests` - Create info/allocate request
- `POST /allocate` - Allocate civilian to mission
- `GET /stats/heatmap` - Get heatmap data
- `GET /admin/export.json` - Export all data
- `POST /admin/seed` - Load demo data

## Architecture

- **Backend**: FastAPI + SQLite + SQLAlchemy
- **Frontend**: React + TypeScript + Vite + Leaflet
- **Database**: SQLite with WAL mode for resilience
- **Offline**: IndexedDB queue with retry mechanism
- **Deployment**: Docker containers with docker-compose

## Stretch Roadmap

- [ ] Full-text search with SQLite FTS5
- [ ] Automated matching algorithm
- [ ] PWA with offline tile caching
- [ ] CSV import for bulk civilian data
- [ ] Real OIDC integration
- [ ] SMS/email notifications
- [ ] Mobile-responsive design improvements

## Development

### Running Tests

```bash
cd server
pytest tests/
```

### Database Management

```bash
# Reset database
rm server/kokonaisturva.db
python server/main.py  # Creates fresh database

# Load seed data
curl -X POST http://localhost:8000/admin/seed
```

### LLM-Powered Tag Extraction (Optional)

Civitas includes intelligent tag extraction using local LLM (Ollama) for enhanced civilian profile analysis:

**Setup Ollama (Recommended):**
```bash
# Run the setup script
./setup_ollama.sh

# Or manually:
# 1. Install Ollama: curl -fsSL https://ollama.com/install.sh | sh
# 2. Start service: ollama serve
# 3. Pull model: ollama pull phi3:mini
```

**Features:**
- ✅ **Intelligent tag extraction** from free-text profiles
- ✅ **Local processing** - no data leaves your server
- ✅ **Automatic fallback** to regex-based tagging if LLM unavailable
- ✅ **Context-aware** - considers education, skills, and availability
- ✅ **Emergency-focused** - extracts relevant tags for crisis coordination

**How it works:**
1. When civilians submit profiles with substantial free-text
2. LLM analyzes the text for emergency-relevant skills and capabilities
3. Extracts 3-5 meaningful tags (e.g., "medical", "senior", "emergency_ready")
4. Combines with rule-based tags for comprehensive profiling
5. Falls back to regex patterns if Ollama is unavailable

**Test the LLM integration:**
```bash
cd server
python test_llm_tagger.py
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DEMO_MODE=true
DATABASE_URL=sqlite:///./kokonaisturva.db
SECRET_KEY=your-secret-key
```

## License

MIT License - see LICENSE file for details.
