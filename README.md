# Kokonaisturvallisuus MVP

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

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DEMO_MODE=true
DATABASE_URL=sqlite:///./kokonaisturva.db
SECRET_KEY=your-secret-key
```

## License

MIT License - see LICENSE file for details.
