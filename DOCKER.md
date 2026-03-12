# Docker & Docker Compose Setup Guide

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)

### Install Docker

**Windows/Mac:**
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
```

## Quick Start with Docker Compose

### 1. Clone/Navigate to Project

```bash
cd e:\postgresql-dashboard
```

### 2. Create Environment File

```bash
copy .env.example .env
```

Edit `.env` to customize database credentials if needed:
```
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=postgres
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### 3. Start All Services

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Build and start FastAPI backend
- Build and start React frontend with Nginx
- Set up networking between containers

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

### 5. Stop Services

```bash
docker-compose down
```

### 6. Stop Services & Remove Data

```bash
docker-compose down -v
```

## Docker Compose Services

### PostgreSQL (`postgres`)
- Image: `postgres:15-alpine`
- Port: `5432`
- Volumes: `postgres_data` (persistent)
- Environment: Database credentials from `.env`

### Backend (`backend`)
- Dockerfile: `backend/Dockerfile`
- Port: `8000`
- Depends on: PostgreSQL
- Environment: Database connection from `.env`

### Frontend (`frontend`)
- Dockerfile: `frontend/Dockerfile`
- Port: `3000`
- Depends on: Backend
- Reverse Proxy: Nginx with API proxy to backend

## Useful Commands

### Using Makefile (Windows/Linux/Mac)

If `make` is installed, use convenient commands:

```bash
# Show all available commands
make help

# Start all services (production)
make up

# Stop services
make down

# View logs
make logs                  # All services
make logs-backend         # Backend only
make logs-frontend        # Frontend only

# Development mode with hot reload
make dev

# Database commands
make db-shell             # Connect to PostgreSQL
make db-dump              # Backup database
make health               # Check service health

# Clean up
make clean                # Stop and remove all
make prune                # Clean unused Docker resources
```

### Using Docker Compose Directly

```bash
# Start services in foreground (see logs)
docker-compose up

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f          # All services
docker-compose logs -f backend  # Single service
docker-compose logs -f frontend # Single service

# Stop services
docker-compose stop

# Restart services
docker-compose restart

# Remove containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build

# Rebuild and restart
docker-compose up -d --build

# Shell access
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres
```

## Development Workflow

### Hot Reload Development Mode

The project includes a development compose file with hot reload enabled:

```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up

# Or use Makefile
make dev
```

**What's different in development mode:**
- Backend code mounted as volume (auto-reload on file changes)
- Frontend code mounted as volume (React hot reload)
- Node development server running (not production build)
- Direct access to source files for debugging

**Features:**
- Edit code and see changes immediately
- Full logging output in terminal
- Access to container shells for debugging

### Development Volume Mounts

**Backend:**
- Mounts `./backend:/app` for source code changes
- Python app reloads on file changes
- Full access to logs

**Frontend:**
- Mounts `./frontend/src` for source code
- Mounts `./frontend/public` for assets
- React development server with hot reload
- Browser auto-refresh on changes

### Production Build

```bash
# Build production images
docker-compose build

# Or rebuild and start
docker-compose up -d --build

# Verify build
docker-compose ps
```

## Troubleshooting

### Port Already in Use

Change ports in `.env`:
```
BACKEND_PORT=8001
FRONTEND_PORT=3001
```

Then update `docker-compose.yml` or use:
```bash
docker-compose up -p custom-port -d
```

### Database Connection Failed

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify PostgreSQL is running
docker-compose ps

# Wait for PostgreSQL to be ready
docker-compose exec postgres pg_isready
```

### Backend Can't Connect to Database

Ensure `DATABASE_HOST=postgres` (the service name, not localhost)

The error is likely in `.env` or environment variables.

### Frontend Shows Blank Page

Check:
1. Backend is running: `docker-compose logs backend`
2. API proxy in `nginx.conf` points to correct backend URL
3. Network connectivity: `docker-compose exec frontend ping backend`

## Production Deployment

For production, consider:

1. **Use environment-specific compose files:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

2. **Add SSL/TLS** with Let's Encrypt for Nginx

3. **Use proper secrets** for database credentials

4. **Add load balancing** with reverse proxy

5. **Set resource limits** in compose file:
   ```yaml
   backend:
     deploy:
       resources:
         limits:
           cpus: '1'
           memory: 512M
   ```

6. **Use named volumes** for data persistence

## Docker Images

### Backend Image
```
postgresql-dashboard:backend
```

**Build manually:**
```bash
docker build -t postgresql-dashboard:backend ./backend
```

### Frontend Image
```
postgresql-dashboard:frontend
```

**Build manually:**
```bash
docker build -t postgresql-dashboard:frontend ./frontend
```

## Network Configuration

All services communicate on the `dashboard-network` bridge network:
- Frontend → Backend: `http://backend:8000`
- Backend → Database: `postgres://postgres:5432`
- Frontend → Database: Not directly (goes through backend)

## Volume Management

### PostgreSQL Data Volume

View volumes:
```bash
docker volume ls

# Inspect specific volume
docker volume inspect postgresql-dashboard_postgres_data

# Backup data
docker run --rm -v postgresql-dashboard_postgres_data:/data -v C:\backup:/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Health Checks

All services include health checks:

```bash
# View health status
docker-compose ps

# Check specific service health
docker inspect postgresql-dashboard-backend | grep -A 5 "Health"
```

## Additional Configuration

### Nginx Configuration
Located in `frontend/nginx.conf`:
- Gzip compression enabled
- Security headers configured
- API proxy to backend
- Static file caching
- React Router support (fallback to index.html)

### Building Images Separately

```bash
# Backend only
docker build -t postgresql-dashboard:backend ./backend

# Frontend only
docker build -t postgresql-dashboard:frontend ./frontend

# Then use in docker-compose
docker-compose up -d
```
