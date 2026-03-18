import React, { useState } from 'react';
import { databaseApi } from '../../api';
import './index.css';
import './light.css';
import './dark.css';

function ConnectionForm({ onConnect, isDarkMode = false, onToggleTheme }) {
  const [formData, setFormData] = useState({
    host: '',
    port: 5432,
    user: '',
    password: '',
    database: '',
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
      await databaseApi.connect(formData);
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
      <div className="connectionform-toolbar">
        <button
          type="button"
          className="connectionform-theme-btn"
          onClick={onToggleTheme}
        >
          {isDarkMode ? 'Light Theme' : 'Dark Theme'}
        </button>
      </div>
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
              placeholder="e.g., localhost, host.docker.internal, or your IP"
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
              placeholder="5432"
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
              placeholder="e.g., postgres"
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
              placeholder="Enter database password"
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
              placeholder="e.g., course_seller"
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
