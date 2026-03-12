# PostgreSQL Dashboard - Quick Start Guide

## Option 1: Docker Compose (Recommended)

**Prerequisites:** Docker & Docker Compose

```bash
# 1. Create environment file
copy .env.example .env

# 2. Start all services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Docs: http://localhost:8000/docs

# 4. Stop services
docker-compose down
```

For detailed Docker instructions, see [DOCKER.md](DOCKER.md)

---

## Option 2: Manual Setup

**Prerequisites:** Python 3.8+, Node.js 16+, PostgreSQL running

### 1. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your PostgreSQL credentials
python main.py
```

Backend runs on: **http://localhost:8000**

### 2. Frontend Setup (React)

```bash
cd frontend
npm install
copy .env.example .env
npm start
```

Frontend runs on: **http://localhost:3000**

---



### Backend
- `main.py` - FastAPI application entry point
- `app/routes/database.py` - API endpoints for database operations
- `app/services/pg_service.py` - PostgreSQL connection and query logic
- `app/models/schemas.py` - Pydantic request/response schemas

### Frontend
- `src/App.js` - Main application component
- `src/components/ConnectionForm.js` - Database connection interface
- `src/components/Dashboard.js` - Main dashboard with database/table explorer
- `src/api.js` - API client for backend communication

## Features

✅ Connect to PostgreSQL databases  
✅ View all databases and tables  
✅ Browse table data with schema information  
✅ Real-time row counts  
✅ Responsive UI with error handling  
✅ CORS-enabled API for cross-origin requests  

## API Documentation

Once backend is running, visit: **http://localhost:8000/docs**

### Key Endpoints
- `POST /api/database/connect` - Establish database connection
- `GET /api/database/databases` - List all databases
- `GET /api/database/tables` - List all tables
- `GET /api/database/table/{table_name}` - Get table data
- `GET /api/database/table/{table_name}/count` - Get row count

## Configuration

Create `.env` files for both backend and frontend:

**backend/.env**
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=postgres
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:8000
```

## Development

- Backend uses FastAPI's automatic reload
- Frontend uses React development server with hot reload
- Both services can run simultaneously in separate terminals

## Troubleshooting

**Connection refused**: Ensure PostgreSQL is running and credentials are correct  
**CORS errors**: Frontend API URL must match backend URL  
**Port conflicts**: Change port in `main.py` (backend) or `.env` (frontend)  

## Next Steps

- [ ] Add query builder UI
- [ ] Implement data export (CSV/JSON)
- [ ] Add authentication
- [ ] Support for stored procedures
- [ ] Database statistics and monitoring
