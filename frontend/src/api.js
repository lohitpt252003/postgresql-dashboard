import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const databaseApi = {
  connect: (connectionData) => api.post('/api/database/connect', connectionData),
  disconnect: () => api.post('/api/database/disconnect'),
  getDatabases: () => api.get('/api/database/databases'),
  getTables: () => api.get('/api/database/tables'),
  getTableData: (tableName, limit = 100) => 
    api.get(`/api/database/table/${tableName}`, { params: { limit } }),
  getTableRowCount: (tableName) => 
    api.get(`/api/database/table/${tableName}/count`),
};

export default api;
