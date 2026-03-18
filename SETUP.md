# PostgreSQL Dashboard - Quick Start

## Docker

1. Update the root `.env` file with the ports you want to expose.
2. Start the app:

```bash
docker-compose up -d
```

3. Open:

- Frontend: http://localhost:3001
- Backend: http://localhost:8001
- Docs: http://localhost:8001/docs

4. Stop it with:

```bash
docker-compose down
```

See [DOCKER.md](./DOCKER.md) for the Docker-specific notes.

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
$env:REACT_APP_API_URL='http://localhost:8000'
npm start
```

Frontend runs on `http://localhost:3000`.

## What You Can Do

- Connect to a PostgreSQL database by host, port, user, password, and database name
- Browse databases and schema-qualified relations
- Inspect fields, types, defaults, and nullability
- View incoming and outgoing foreign-key relationships
- Preview sample rows from the selected relation
