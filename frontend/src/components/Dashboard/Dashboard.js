import React, { useState, useEffect } from 'react';
import { databaseApi } from '../../api';
import './index.css';
import './light.css';
import './dark.css';
import './mlight.css';
import './mdark.css';

function Dashboard({ connectionData, onDisconnect, isDarkMode = false }) {
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
        <div className="dashboard-connectioninfo">
          <span className="dashboard-connectiontext">
            {connectionData.user}@{connectionData.host}:{connectionData.port}/{connectionData.database}
          </span>
          <button className="dashboard-disconnectbtn" onClick={handleDisconnect}>Disconnect</button>
        </div>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="dashboard-section">
            <h3 className="dashboard-sectiontitle">Databases</h3>
            <div className="dashboard-list">
              {databases.map((db) => (
                <div key={db} className="dashboard-dbitem">{db}</div>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <h3 className="dashboard-sectiontitle">Relations</h3>
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
                  className={`dashboard-tableitem ${isActive ? 'active' : ''}`}
                  onClick={() => handleRelationClick(relation)}
                >
                  <div className="dashboard-relationitem">
                    <span className="dashboard-relationname">{relationKey}</span>
                    <span className="dashboard-relationtype">{relation.type}</span>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dashboard-maincontent">
          {selectedRelation ? (
            <div className="dashboard-tableview">
              <div className="dashboard-tableheader">
                <div className="dashboard-relationheadercopy">
                  <h2 className="dashboard-tablename">
                    {selectedRelation.schema}.{selectedRelation.name}
                  </h2>
                  <p className="dashboard-relationmeta">
                    {selectedRelation.type} with {relationDetails.columns.length} fields
                  </p>
                </div>
                <span className="dashboard-rowcount">({relationDetails.row_count} rows)</span>
              </div>

              {loadingDetails ? (
                <p className="dashboard-loading">Loading relation details...</p>
              ) : (
                <>
                  <div className="dashboard-metadata">
                    <section className="dashboard-metacard">
                      <h3 className="dashboard-metatitle">Fields</h3>
                      {relationDetails.columns.length > 0 ? (
                        <div className="dashboard-fieldlist">
                          {relationDetails.columns.map((column) => (
                            <div key={column.name} className="dashboard-fielditem">
                              <div className="dashboard-fieldtopline">
                                <span className="dashboard-fieldname">{column.name}</span>
                                <span className="dashboard-fieldtype">{column.type}</span>
                              </div>
                              <div className="dashboard-fieldmeta">
                                <span>{column.nullable ? 'nullable' : 'required'}</span>
                                <span>{column.default ? `default: ${column.default}` : 'no default'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="dashboard-nodata">No fields found</p>
                      )}
                    </section>

                    <section className="dashboard-metacard">
                      <h3 className="dashboard-metatitle">Relationships</h3>
                      <div className="dashboard-relationshipgroup">
                        <h4 className="dashboard-relationshiptitle">Outgoing</h4>
                        {relationDetails.relationships.outgoing.length > 0 ? (
                          <div className="dashboard-relationshiplist">
                            {relationDetails.relationships.outgoing.map((relationship) => (
                              <div
                                key={`${relationship.constraint_name}-${relationship.column}`}
                                className="dashboard-relationshipitem"
                              >
                                {relationship.column} -> {relationship.references_schema}.
                                {relationship.references_relation}.{relationship.references_column}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="dashboard-nodata">No outgoing foreign keys</p>
                        )}
                      </div>

                      <div className="dashboard-relationshipgroup">
                        <h4 className="dashboard-relationshiptitle">Incoming</h4>
                        {relationDetails.relationships.incoming.length > 0 ? (
                          <div className="dashboard-relationshiplist">
                            {relationDetails.relationships.incoming.map((relationship) => (
                              <div
                                key={`${relationship.constraint_name}-${relationship.source_relation}-${relationship.source_column}`}
                                className="dashboard-relationshipitem"
                              >
                                {relationship.source_schema}.{relationship.source_relation}.
                                {relationship.source_column} -> {relationship.target_column}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="dashboard-nodata">No incoming foreign keys</p>
                        )}
                      </div>
                    </section>
                  </div>

                  <section className="dashboard-sampledata">
                    <div className="dashboard-sampleheader">
                      <h3 className="dashboard-metatitle">Sample Data</h3>
                      <span className="dashboard-rowcount">Showing up to 100 rows</span>
                    </div>

                    {relationDetails.columns.length > 0 ? (
                      relationDetails.rows.length > 0 ? (
                        <div className="dashboard-tablecontainer">
                          <table>
                            <thead>
                              <tr>
                                {relationDetails.columns.map((column) => (
                                  <th key={column.name}>
                                    <div className="dashboard-columnheader">
                                      <span>{column.name}</span>
                                      <span className="dashboard-columntype">{column.type}</span>
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
                        <p className="dashboard-nodata">No rows to display</p>
                      )
                    ) : (
                      <p className="dashboard-nodata">No fields available for this relation</p>
                    )}
                  </section>
                </>
              )}
            </div>
          ) : (
            <div className="dashboard-noselection">
              <p>Select a relation to inspect its fields, foreign keys, and rows</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
