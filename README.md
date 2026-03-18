# PostgreSQL Dashboard

A full-stack dashboard for connecting to a PostgreSQL database and exploring its relations, fields, foreign-key relationships, and sample rows.

## Stack

- Frontend: React 18 + Axios + Nginx
- Backend: FastAPI + psycopg2
- Runtime: Docker Compose

## Quick Start

```bash
docker-compose up -d
```

Open:

- Frontend: http://localhost:3001
- Backend API: http://localhost:8001
- API docs: http://localhost:8001/docs

Stop the app with:

```bash
docker-compose down
```

## Manual Run

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
set REACT_APP_API_URL=http://localhost:8000
npm start
```

Frontend runs on `http://localhost:3000`.

## Features

- Connect with host, port, user, password, and database name
- Browse available databases
- Browse schema-qualified relations
- Inspect field names, types, defaults, and nullability
- Inspect incoming and outgoing foreign-key relationships
- Preview sample rows from the selected relation

## API

- `POST /api/database/connect`
- `POST /api/database/disconnect`
- `GET /api/database/databases`
- `GET /api/database/tables`
- `GET /api/database/relations`
- `GET /api/database/relation-details?schema=public&name=your_table`
- `GET /api/database/table/{table_name}`
- `GET /api/database/table/{table_name}/count`

## Notes

- The backend stores a single active PostgreSQL connection in process memory.
- If the backend runs in Docker and you enter `localhost` as the database host, the backend resolves that appropriately for the containerized runtime.
- The relation preview is limited to 100 rows by default.

## More

- Docker details: [DOCKER.md](./DOCKER.md)
- Quick setup: [SETUP.md](./SETUP.md)
