# Civitas - Finnish Civilian-to-Authority Coordination System

A lightweight, fault-tolerant MVP for Finnish civilian-to-authority coordination tool designed for defense, emergency, and national security scenarios.

## Overview

This system enables coordination between civilians and authorities during emergency situations through two main flows:

1. **Civilian Flow**: Civilians submit their capabilities, resources, and availability through a secure form with intelligent tag extraction
2. **Authority Flow**: Authorities can search, filter, and allocate civilian resources on an interactive map with multiple view modes

## Key Features

### Defense & Emergency Focus
- **186+ Defense-focused skills** including drone piloting, cybersecurity, military communications, combat operations
- **Intelligent tag extraction** using local LLM (Ollama) with regex fallback
- **Query-relevant scoring** - civilians ranked by how well they match search criteria
- **Resource tracking** - civilians can report tools, vehicles, and equipment

### Advanced Map Interface
- **Three view modes**: Map, Table, and Heat Map
- **Night mode** for enhanced heatmap visualization
- **Interactive search** with location, radius, and skill filtering
- **Real-time heatmap** showing civilian density across regions
- **Export capabilities** for CSV data download

### Privacy & Security Model

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
3. **Submit profile**: Fill education, skills, availability, resources, and submit
4. **Switch to authority**: Login Mock → Choose "Authority" role  
5. **Search civilians**: Use location, radius, and skill filters
6. **View modes**: Toggle between Map, Table, and Heat Map views
7. **Request info**: Click on civilian → "Request info" → send message
8. **Allocate**: Click "Allocate" → enter mission code → confirm
9. **Verify PII reveal**: After allocation, civilian details show full information
10. **Export data**: Use CSV export in table view or visit http://localhost:8000/admin/export.json

## Defense-Focused Skills Database

The system includes **186+ specialized skills** covering:

### Drone & UAV Operations
- Drone Piloting, UAV Operations, Drone Building
- FPV Racing, Aerial Surveillance, Autonomous Systems

### Automation & Robotics
- Industrial Automation, PLC Programming, SCADA Systems
- Robotics, Autonomous Systems

### Cybersecurity & Defense
- Cybersecurity, Network Security, Penetration Testing
- Digital Forensics, Electronic Warfare, Signal Intelligence
- Military Communications, Secure Communications

### Military & Combat
- Military Experience, Combat Operations, Defense Systems
- Weapons Systems, Explosive Ordnance Disposal
- Counter-Intelligence, Intelligence Analysis

### Military Medicine
- Tactical Medicine, Combat First Aid, Field Medicine
- Trauma Care, Emergency Response

### Advanced Cybersecurity
- Malware Analysis, Reverse Engineering, Cryptanalysis
- Quantum Cryptography, AI Security, IoT Security

## API Endpoints

### Core Endpoints
- `POST /civilian/submit` - Submit civilian profile (idempotent)
- `GET /civilian/me` - Get current civilian profile
- `POST /search/advanced` - Advanced search with filters and scoring
- `GET /detail/{user_id}` - Get civilian details (PII hidden until allocated)
- `POST /requests` - Create info/allocate request
- `POST /allocate` - Allocate civilian to mission

### Data & Analytics
- `GET /stats/heatmap` - Get heatmap data for visualization
- `GET /admin/export.json` - Export all data as JSON
- `GET /admin/export.csv` - Export search results as CSV
- `POST /admin/seed` - Load demo data

### Skills & Suggestions
- `GET /skills/suggest` - Get skill suggestions for typeahead
- `GET /search/tags/suggest` - Get tag suggestions
- `GET /healthz` - Health check endpoint

## Architecture

### Backend
- **FastAPI** + SQLite + SQLAlchemy
- **Local LLM integration** with Ollama (phi3:mini model)
- **Query-relevant scoring** algorithm
- **SQLite WAL mode** for resilience

### Frontend
- **React** + TypeScript + Vite
- **Leaflet** maps with heatmap visualization
- **Three view modes**: Map, Table, Heat Map
- **Offline queue** with IndexedDB and retry mechanism

### Deployment
- **Docker containers** with docker-compose
- **Ollama service** for local LLM processing
- **GPU support** for enhanced LLM performance

## LLM-Powered Tag Extraction

Civitas includes intelligent tag extraction using local LLM (Ollama) for enhanced civilian profile analysis:

### Setup Ollama (Recommended)
```bash
# Run the setup script
./setup_ollama.sh

# Or manually:
# 1. Install Ollama: curl -fsSL https://ollama.com/install.sh | sh
# 2. Start service: ollama serve
# 3. Pull model: ollama pull phi3:mini
```

### Features
- **Intelligent tag extraction** from free-text profiles
- **Local processing** - no data leaves your server
- **Automatic fallback** to regex-based tagging if LLM unavailable
- **Context-aware** - considers education, skills, and availability
- **Defense-focused** - extracts relevant tags for military and emergency coordination
- **Privacy-preserving** - all processing happens locally

### How it works
1. When civilians submit profiles with substantial free-text
2. LLM analyzes the text for defense and emergency-relevant skills
3. Extracts 3-5 meaningful tags (e.g., "drone_pilot", "cybersecurity", "military_experience")
4. Combines with rule-based tags for comprehensive profiling
5. Falls back to regex patterns if Ollama is unavailable

## View Modes

### Map View (Default)
- Interactive markers with civilian locations
- Search radius visualization
- Click markers for details and actions

### Table View
- Sortable columns: Rank, ID, Status, Distance, Score, Skills, Tags
- Export to CSV functionality
- Secondary sorting by clicking column headers

### Heat Map View
- Population density visualization
- Blue-to-red color gradient
- Dark night mode for enhanced visibility
- Smooth density transitions

## Search & Filtering

### Location Controls
- **Use my location** - GPS-based search
- **Search city/town/address** - Geocoded place search
- **Use current map center** - Map-based positioning

### Advanced Filters
- **Skills typeahead** - Real-time skill suggestions with chips
- **Tag filtering** - Include specific tags (must have)
- **Skill level matrix** - 0-5 ratings for 5 key skills
- **Status filtering** - Available/Allocated checkboxes
- **Sorting options** - Distance, Capability Score, Combined

### Query-Relevant Scoring
- **Dynamic scoring** based on search criteria
- **Weighted matching** for skills and tags
- **Education and availability** modifiers
- **Real-time ranking** updates

## Stretch Roadmap

### Phase 2 Features
- [ ] Full-text search with SQLite FTS5
- [ ] Automated matching algorithm
- [ ] PWA with offline tile caching
- [ ] CSV import for bulk civilian data
- [ ] Real OIDC integration
- [ ] SMS/email notifications

### Phase 3 Features
- [ ] Mobile-responsive design improvements
- [ ] Advanced analytics dashboard
- [ ] Integration with external defense systems
- [ ] Multi-language support
- [ ] Advanced reporting and metrics

## Development

### Running Tests
```bash
cd server
pytest tests/
```

### Database Management
```bash
# Reset database
rm kokonaisturva.db
python server/main.py  # Creates fresh database

# Load seed data
curl -X POST http://localhost:8000/admin/seed

# Check database contents
sqlite3 kokonaisturva.db "SELECT COUNT(*) FROM users;"
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DEMO_MODE=true
DATABASE_URL=sqlite:///./kokonaisturva.db
SECRET_KEY=your-secret-key
API_HOST=0.0.0.0
API_PORT=8000
```

## Sample Data

The system includes **70 realistic Finnish civilians** with:
- **Diverse locations** across Finland (Helsinki, Tampere, Turku, Oulu, etc.)
- **Defense-focused skills** including drone piloting, cybersecurity, military experience
- **Realistic profiles** with education levels, availability, and resources
- **Geographic distribution** from urban centers to rural areas

## License

MIT License - see LICENSE file for details.

---

**Built for Finnish defense and emergency coordination scenarios**
