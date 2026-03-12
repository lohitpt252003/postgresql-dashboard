# PostgreSQL Dashboard

A full-stack dashboard application for exploring PostgreSQL databases, tables, and their data.

## Stack

- **Frontend**: React 18 with JavaScript + Nginx
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose

## Quick Start with Docker

The easiest way to get started:

```bash
# Create environment file
copy .env.example .env

# Start all services
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

See [DOCKER.md](DOCKER.md) for detailed Docker Compose instructions.

## Project Structure

```
postgresql-dashboard/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── routes/      # API routes
│   │   ├── models/      # Pydantic models/schemas
│   │   └── services/    # Database service
│   ├── main.py          # FastAPI app entry point
│   ├── requirements.txt  # Python dependencies
│   └── .env.example     # Environment variables template
└── frontend/            # React frontend
    ├── public/
    ├── src/
    │   ├── components/  # React components
    │   └── api.js      # API client
    ├── package.json    # NPM dependencies
    └── .env.example    # React environment variables
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or
   source venv/bin/activate  # On macOS/Linux
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file from template:**
   ```bash
   copy .env.example .env  # On Windows
   # or
   cp .env.example .env  # On macOS/Linux
   ```

5. **Update `.env` with your PostgreSQL credentials:**
   ```
   DATABASE_HOST=your_host
   DATABASE_PORT=5432
   DATABASE_USER=your_user
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=your_database
   ```

6. **Run the FastAPI server:**
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`
   
   **API Documentation:** Visit `http://localhost:8000/docs` for interactive Swagger UI

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file from template:**
   ```bash
   copy .env.example .env  # On Windows
   # or
   cp .env.example .env  # On macOS/Linux
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## Features

- **Database Connection**: Connect to PostgreSQL with host, port, user, password, and database credentials
- **Database Browser**: View all available databases
- **Table Explorer**: Browse all tables in the connected database
- **Data Viewer**: View table data with column types and row counts (pagination support)
- **Real-time Sync**: Responsive UI with loading states and error handling

## API Endpoints

### Connection
- `POST /api/database/connect` - Connect to a PostgreSQL database
- `POST /api/database/disconnect` - Disconnect from database

### Database Operations
- `GET /api/database/databases` - Get list of all databases
- `GET /api/database/tables` - Get list of tables in current database
- `GET /api/database/table/{table_name}` - Get table data with columns and rows
- `GET /api/database/table/{table_name}/count` - Get row count for a table

## Environment Variables

### Backend (`.env`)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=postgres
```

### Frontend (`.env`)
```
REACT_APP_API_URL=http://localhost:8000
```

## Usage

1. Start both backend and frontend services
2. Open the dashboard at `http://localhost:3000`
3. Enter your PostgreSQL credentials in the connection form
4. Click "Connect" to establish the connection
5. Browse databases and tables in the sidebar
6. Click on a table to view its data

## Notes

- The backend stores connection details in memory. In production, implement proper session/auth management
- Default limit for table data display is 100 rows. Modify in `api.js` as needed
- CORS is configured to allow all origins. In production, restrict this to specific domains

## Future Enhancements

- [ ] Query builder and custom SQL execution
- [ ] Data export (CSV, JSON)
- [ ] Advanced filtering and sorting
- [ ] Query history and bookmarks
- [ ] User authentication and authorization
- [ ] Database backup/restore functionality
- [ ] Performance metrics and statistics

## License

MIT