import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

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
  getRelations: () => api.get('/api/database/relations'),
  getRelationDetails: (schema, name, limit = 100) =>
    api.get('/api/database/relation-details', { params: { schema, name, limit } }),
  getTableData: (tableName, limit = 100, schema = 'public') =>
    api.get(`/api/database/table/${tableName}`, { params: { limit, schema } }),
  getTableRowCount: (tableName, schema = 'public') =>
    api.get(`/api/database/table/${tableName}/count`, { params: { schema } }),
};

export default api;
