# Docker & Docker Compose Setup Guide

## Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose v2

## Quick Start

1. Create the environment file:

```bash
edit .env
```

2. Update `.env` with the host, port, username, password, and database name for the PostgreSQL instance you want to inspect.

3. Start the stack:

```bash
docker-compose up -d
```

4. Open the app:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8001
- API docs: http://localhost:8001/docs

## Services

### Backend

- Image source: `backend/Dockerfile`
- Container port: `8000`
- Host port: `8001` by default
- Purpose: FastAPI API for connection management, relation discovery, field metadata, foreign keys, and sample rows

### Frontend

- Image source: `frontend/Dockerfile`
- Container port: `3000`
- Host port: `3001` by default
- Purpose: React dashboard served by a simple Node static server
- API access: direct browser requests to `http://localhost:8001`

## Development Mode

For local non-Docker development, run the backend and frontend directly from [SETUP.md](./SETUP.md).

## Useful Commands

```bash
docker-compose up -d
docker-compose down
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose build
docker-compose restart
docker-compose exec backend bash
docker-compose exec frontend sh
```

If `make` is available, the root [Makefile](./Makefile) wraps the same commands with `make up`, `make dev`, `make logs`, `make health`, and related helpers.

## Notes

- This stack does not run a PostgreSQL container. It connects to an external PostgreSQL instance using the credentials you enter in the app.
- In Docker mode, the frontend build is configured with `REACT_APP_API_URL=http://localhost:8001`.
- For local frontend development, set `REACT_APP_API_URL=http://localhost:8000`.
- The backend process stores one active PostgreSQL connection in memory, so it is not multi-user safe yet.

## Troubleshooting

### Backend cannot connect

- Confirm the PostgreSQL server is reachable from the backend container.
- Check the credentials you entered in the UI.
- Review backend logs with `docker-compose logs -f backend`.

### Frontend cannot load API data

- Confirm the backend is healthy at `http://localhost:8001/health`.
- Confirm the frontend container was built with `REACT_APP_API_URL=http://localhost:8001`.
- For local frontend development, confirm `REACT_APP_API_URL` points to `http://localhost:8000`.
