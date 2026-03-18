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
    editability: { is_editable: false, reason: null, primary_key_columns: [] },
    row_count: 0,
    rows: [],
  });
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [rowDraft, setRowDraft] = useState({});
  const [savingRow, setSavingRow] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverview();
  }, []);

  const emptyRelationDetails = {
    columns: [],
    relationships: { outgoing: [], incoming: [] },
    editability: { is_editable: false, reason: null, primary_key_columns: [] },
    row_count: 0,
    rows: [],
  };

  const resetRowEditor = () => {
    setEditingRowIndex(null);
    setRowDraft({});
    setSavingRow(false);
  };

  const buildRowObject = (row) =>
    relationDetails.columns.reduce((rowObject, column, columnIndex) => {
      rowObject[column.name] = row[columnIndex];
      return rowObject;
    }, {});

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
    resetRowEditor();
    try {
      const response = await databaseApi.getRelationDetails(relation.schema, relation.name);
      setRelationDetails(response.data);
      setError('');
    } catch (err) {
      setRelationDetails(emptyRelationDetails);
      setError(err.response?.data?.detail || 'Failed to fetch relation details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStartEditRow = (rowIndex, row) => {
    const primaryKeyColumns = relationDetails.editability.primary_key_columns;
    const nextDraft = relationDetails.columns.reduce((draft, column, columnIndex) => {
      const cellValue = row[columnIndex];
      draft[column.name] = {
        value: cellValue === null ? '' : String(cellValue),
        isNull: cellValue === null,
        isPrimaryKey: primaryKeyColumns.includes(column.name),
        nullable: column.nullable,
      };
      return draft;
    }, {});

    setEditingRowIndex(rowIndex);
    setRowDraft(nextDraft);
  };

  const handleDraftValueChange = (columnName, value) => {
    setRowDraft((currentDraft) => ({
      ...currentDraft,
      [columnName]: {
        ...currentDraft[columnName],
        value,
      },
    }));
  };

  const handleDraftNullToggle = (columnName, isNull) => {
    setRowDraft((currentDraft) => ({
      ...currentDraft,
      [columnName]: {
        ...currentDraft[columnName],
        isNull,
      },
    }));
  };

  const handleSaveRow = async () => {
    if (!selectedRelation || editingRowIndex === null) {
      return;
    }

    const originalRow = relationDetails.rows[editingRowIndex];
    if (!originalRow) {
      setError('The selected row is no longer available.');
      return;
    }

    const originalRowObject = buildRowObject(originalRow);
    const primaryKey = {};
    relationDetails.editability.primary_key_columns.forEach((columnName) => {
      primaryKey[columnName] = originalRowObject[columnName];
    });

    const values = {};
    relationDetails.columns.forEach((column) => {
      const fieldDraft = rowDraft[column.name];
      if (!fieldDraft || fieldDraft.isPrimaryKey) {
        return;
      }

      values[column.name] = fieldDraft.isNull ? null : fieldDraft.value;
    });

    setSavingRow(true);
    try {
      await databaseApi.updateRelationRow({
        schema: selectedRelation.schema,
        relation: selectedRelation.name,
        primary_key: primaryKey,
        values,
      });
      await handleRelationClick(selectedRelation);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update row');
      setSavingRow(false);
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
                                {relationship.column} -&gt; {relationship.references_schema}.
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
                                {relationship.source_column} -&gt; {relationship.target_column}
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
                      <div className="dashboard-sample-copy">
                        <h3 className="dashboard-meta-title">Sample Data</h3>
                        {relationDetails.editability.is_editable ? (
                          <p className="dashboard-editability-note">
                            Rows can be edited and saved back to PostgreSQL.
                          </p>
                        ) : (
                          <p className="dashboard-editability-note">
                            Read-only: {relationDetails.editability.reason || 'This relation cannot be edited.'}
                          </p>
                        )}
                      </div>
                      <span className="dashboard-row-count">Showing up to 100 rows</span>
                    </div>

                    {relationDetails.columns.length > 0 ? (
                      relationDetails.rows.length > 0 ? (
                        <>
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
                                  {relationDetails.editability.is_editable && <th>Actions</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {relationDetails.rows.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className={editingRowIndex === rowIndex ? 'dashboard-row-active' : ''}
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <td key={cellIndex}>{cell !== null ? String(cell) : 'NULL'}</td>
                                    ))}
                                    {relationDetails.editability.is_editable && (
                                      <td>
                                        <button
                                          type="button"
                                          className="dashboard-row-action-btn"
                                          onClick={() => handleStartEditRow(rowIndex, row)}
                                        >
                                          {editingRowIndex === rowIndex ? 'Editing' : 'Edit'}
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {editingRowIndex !== null && (
                            <div className="dashboard-editor">
                              <div className="dashboard-editor-header">
                                <div>
                                  <h3 className="dashboard-meta-title">Edit Row</h3>
                                  <p className="dashboard-editability-note">
                                    Primary key fields are locked to keep the update targeted safely.
                                  </p>
                                </div>
                                <div className="dashboard-editor-actions">
                                  <button
                                    type="button"
                                    className="dashboard-editor-btn dashboard-editor-btn-secondary"
                                    onClick={resetRowEditor}
                                    disabled={savingRow}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="dashboard-editor-btn dashboard-editor-btn-primary"
                                    onClick={handleSaveRow}
                                    disabled={savingRow}
                                  >
                                    {savingRow ? 'Saving...' : 'Save Changes'}
                                  </button>
                                </div>
                              </div>

                              <div className="dashboard-editor-grid">
                                {relationDetails.columns.map((column) => {
                                  const fieldDraft = rowDraft[column.name];
                                  if (!fieldDraft) {
                                    return null;
                                  }

                                  return (
                                    <div key={column.name} className="dashboard-editor-field">
                                      <div className="dashboard-field-topline">
                                        <label className="dashboard-field-name" htmlFor={`edit-${column.name}`}>
                                          {column.name}
                                        </label>
                                        <span className="dashboard-field-type">{column.type}</span>
                                      </div>
                                      <input
                                        id={`edit-${column.name}`}
                                        className="dashboard-editor-input"
                                        value={fieldDraft.isNull ? '' : fieldDraft.value}
                                        onChange={(event) => handleDraftValueChange(column.name, event.target.value)}
                                        disabled={fieldDraft.isPrimaryKey || fieldDraft.isNull || savingRow}
                                      />
                                      <div className="dashboard-editor-meta">
                                        <span>
                                          {fieldDraft.isPrimaryKey ? 'primary key' : (column.nullable ? 'nullable' : 'required')}
                                        </span>
                                        {column.nullable && !fieldDraft.isPrimaryKey && (
                                          <label className="dashboard-null-toggle">
                                            <input
                                              type="checkbox"
                                              checked={fieldDraft.isNull}
                                              onChange={(event) => handleDraftNullToggle(column.name, event.target.checked)}
                                              disabled={savingRow}
                                            />
                                            <span>Set NULL</span>
                                          </label>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
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
