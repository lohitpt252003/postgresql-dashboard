import React, { useState, useEffect } from 'react';
import { databaseApi } from '../../api';
import './index.css';
import './light.css';
import './dark.css';

function Dashboard({ connectionData, onDisconnect, isDarkMode = false, onToggleTheme }) {
  const [databases, setDatabases] = useState([]);
  const [relations, setRelations] = useState([]);
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [relationDetails, setRelationDetails] = useState({
    columns: [],
    relationships: { outgoing: [], incoming: [] },
    row_count: 0,
    rows: [],
  });
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const [databasesResponse, relationsResponse] = await Promise.all([
        databaseApi.getDatabases(),
        databaseApi.getRelations(),
      ]);
      setDatabases(databasesResponse.data.databases);
      setRelations(relationsResponse.data.relations);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch database metadata');
    } finally {
      setLoadingOverview(false);
    }
  };

  const handleRelationClick = async (relation) => {
    setSelectedRelation(relation);
    setLoadingDetails(true);
    try {
      const response = await databaseApi.getRelationDetails(relation.schema, relation.name);
      setRelationDetails(response.data);
      setError('');
    } catch (err) {
      setRelationDetails({
        columns: [],
        relationships: { outgoing: [], incoming: [] },
        row_count: 0,
        rows: [],
      });
      setError(err.response?.data?.detail || 'Failed to fetch relation details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await databaseApi.disconnect();
      onDisconnect();
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">PostgreSQL Dashboard</h1>
        <div className="dashboard-connection-info">
          <button className="dashboard-theme-btn" onClick={onToggleTheme}>
            {isDarkMode ? 'Light Theme' : 'Dark Theme'}
          </button>
          <span className="dashboard-connection-text">
            {connectionData.user}@{connectionData.host}:{connectionData.port}/{connectionData.database}
          </span>
          <button className="dashboard-disconnect-btn" onClick={handleDisconnect}>Disconnect</button>
        </div>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="dashboard-section">
            <h3 className="dashboard-section-title">Databases</h3>
            <div className="dashboard-list">
              {databases.map((db) => (
                <div key={db} className="dashboard-db-item">{db}</div>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <h3 className="dashboard-section-title">Relations</h3>
            <div className="dashboard-list">
              {loadingOverview && <p className="dashboard-loading">Loading...</p>}
              {relations.map((relation) => {
                const relationKey = `${relation.schema}.${relation.name}`;
                const isActive =
                  selectedRelation &&
                  selectedRelation.schema === relation.schema &&
                  selectedRelation.name === relation.name;

                return (
                <div
                  key={relationKey}
                  className={`dashboard-table-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleRelationClick(relation)}
                >
                  <div className="dashboard-relation-item">
                    <span className="dashboard-relation-name">{relationKey}</span>
                    <span className="dashboard-relation-type">{relation.type}</span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dashboard-main-content">
          {selectedRelation ? (
            <div className="dashboard-table-view">
              <div className="dashboard-table-header">
                <div className="dashboard-relation-header-copy">
                  <h2 className="dashboard-table-name">
                    {selectedRelation.schema}.{selectedRelation.name}
                  </h2>
                  <p className="dashboard-relation-meta">
                    {selectedRelation.type} with {relationDetails.columns.length} fields
                  </p>
                </div>
                <span className="dashboard-row-count">({relationDetails.row_count} rows)</span>
              </div>

              {loadingDetails ? (
                <p className="dashboard-loading">Loading relation details...</p>
              ) : (
                <>
                  <div className="dashboard-metadata">
                    <section className="dashboard-meta-card">
                      <h3 className="dashboard-meta-title">Fields</h3>
                      {relationDetails.columns.length > 0 ? (
                        <div className="dashboard-field-list">
                          {relationDetails.columns.map((column) => (
                            <div key={column.name} className="dashboard-field-item">
                              <div className="dashboard-field-topline">
                                <span className="dashboard-field-name">{column.name}</span>
                                <span className="dashboard-field-type">{column.type}</span>
                              </div>
                              <div className="dashboard-field-meta">
                                <span>{column.nullable ? 'nullable' : 'required'}</span>
                                <span>{column.default ? `default: ${column.default}` : 'no default'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="dashboard-no-data">No fields found</p>
                      )}
                    </section>

                    <section className="dashboard-meta-card">
                      <h3 className="dashboard-meta-title">Relationships</h3>
                      <div className="dashboard-relationship-group">
                        <h4 className="dashboard-relationship-title">Outgoing</h4>
                        {relationDetails.relationships.outgoing.length > 0 ? (
                          <div className="dashboard-relationship-list">
                            {relationDetails.relationships.outgoing.map((relationship) => (
                              <div
                                key={`${relationship.constraint_name}-${relationship.column}`}
                                className="dashboard-relationship-item"
                              >
                                {relationship.column} -> {relationship.references_schema}.
                                {relationship.references_relation}.{relationship.references_column}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="dashboard-no-data">No outgoing foreign keys</p>
                        )}
                      </div>

                      <div className="dashboard-relationship-group">
                        <h4 className="dashboard-relationship-title">Incoming</h4>
                        {relationDetails.relationships.incoming.length > 0 ? (
                          <div className="dashboard-relationship-list">
                            {relationDetails.relationships.incoming.map((relationship) => (
                              <div
                                key={`${relationship.constraint_name}-${relationship.source_relation}-${relationship.source_column}`}
                                className="dashboard-relationship-item"
                              >
                                {relationship.source_schema}.{relationship.source_relation}.
                                {relationship.source_column} -> {relationship.target_column}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="dashboard-no-data">No incoming foreign keys</p>
                        )}
                      </div>
                    </section>
                  </div>

                  <section className="dashboard-sample-data">
                    <div className="dashboard-sample-header">
                      <h3 className="dashboard-meta-title">Sample Data</h3>
                      <span className="dashboard-row-count">Showing up to 100 rows</span>
                    </div>

                    {relationDetails.columns.length > 0 ? (
                      relationDetails.rows.length > 0 ? (
                        <div className="dashboard-table-container">
                          <table>
                            <thead>
                              <tr>
                                {relationDetails.columns.map((column) => (
                                  <th key={column.name}>
                                    <div className="dashboard-column-header">
                                      <span>{column.name}</span>
                                      <span className="dashboard-column-type">{column.type}</span>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {relationDetails.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell !== null ? String(cell) : 'NULL'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="dashboard-no-data">No rows to display</p>
                      )
                    ) : (
                      <p className="dashboard-no-data">No fields available for this relation</p>
                    )}
                  </section>
                </>
              )}
            </div>
          ) : (
            <div className="dashboard-no-selection">
              <p>Select a relation to inspect its fields, foreign keys, and rows</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
