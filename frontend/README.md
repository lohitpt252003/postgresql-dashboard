# Frontend

React frontend for the PostgreSQL Dashboard.

## Run Locally

```bash
npm install
set REACT_APP_API_URL=http://localhost:8000
npm start
```

The app runs on `http://localhost:3000`.

## What It Does

- collects PostgreSQL connection details
- loads databases and schema-qualified relations
- shows field metadata for the selected relation
- shows incoming and outgoing foreign-key relationships
- previews sample rows

## Main Files

- `src/App.js`
- `src/api.js`
- `src/components/ConnectionForm/ConnectionForm.js`
- `src/components/Dashboard/Dashboard.js`

## Production

In Docker, the frontend is served by a simple Node static server and calls the backend directly through `REACT_APP_API_URL`.
