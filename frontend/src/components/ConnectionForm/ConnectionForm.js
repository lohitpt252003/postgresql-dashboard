import React, { useState } from 'react';
import { databaseApi } from '../../api';
import './index.css';
import './light.css';
import './dark.css';
import './mlight.css';
import './mdark.css';

function ConnectionForm({ onConnect, isDarkMode = false }) {
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'postgres',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await databaseApi.connect(formData);
      setError('');
      onConnect(formData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connectionform-container">
      <div className="connectionform-form">
        <h2 className="connectionform-title">Connect to PostgreSQL</h2>
        {error && <div className="connectionform-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="connectionform-group">
            <label htmlFor="host" className="connectionform-label">Host:</label>
            <input
              type="text"
              id="host"
              name="host"
              className="connectionform-input"
              value={formData.host}
              onChange={handleChange}
              required
            />
          </div>

          <div className="connectionform-group">
            <label htmlFor="port" className="connectionform-label">Port:</label>
            <input
              type="number"
              id="port"
              name="port"
              className="connectionform-input"
              value={formData.port}
              onChange={handleChange}
              required
            />
          </div>

          <div className="connectionform-group">
            <label htmlFor="user" className="connectionform-label">User:</label>
            <input
              type="text"
              id="user"
              name="user"
              className="connectionform-input"
              value={formData.user}
              onChange={handleChange}
              required
            />
          </div>

          <div className="connectionform-group">
            <label htmlFor="password" className="connectionform-label">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="connectionform-input"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="connectionform-group">
            <label htmlFor="database" className="connectionform-label">Database:</label>
            <input
              type="text"
              id="database"
              name="database"
              className="connectionform-input"
              value={formData.database}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="connectionform-button" disabled={loading}>
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConnectionForm;
