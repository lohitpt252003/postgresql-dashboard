import React, { useState, useEffect } from 'react';
import { databaseApi } from '../../api';
import './index.css';
import './light.css';
import './dark.css';
import './mlight.css';
import './mdark.css';

function Dashboard({ connectionData, onDisconnect, isDarkMode = false }) {
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState({ columns: [], rows: [] });
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDatabases();
    fetchTables();
  }, []);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const response = await databaseApi.getDatabases();
      setDatabases(response.data.databases);
      setError('');
    } catch (err) {
      setError('Failed to fetch databases');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await databaseApi.getTables();
      setTables(response.data.tables);
      setSelectedTable(null);
      setTableData({ columns: [], rows: [] });
      setError('');
    } catch (err) {
      setError('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = async (tableName) => {
    setSelectedTable(tableName);
    setLoading(true);
    try {
      const [dataResponse, countResponse] = await Promise.all([
        databaseApi.getTableData(tableName),
        databaseApi.getTableRowCount(tableName),
      ]);
      setTableData(dataResponse.data);
      setRowCount(countResponse.data.row_count);
      setError('');
    } catch (err) {
      setError('Failed to fetch table data');
    } finally {
      setLoading(false);
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
            <h3 className="dashboard-sectiontitle">Tables</h3>
            <div className="dashboard-list">
              {loading && <p className="dashboard-loading">Loading...</p>}
              {tables.map((table) => (
                <div
                  key={table}
                  className={`dashboard-tableitem ${selectedTable === table ? 'active' : ''}`}
                  onClick={() => handleTableClick(table)}
                >
                  {table}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-maincontent">
          {selectedTable ? (
            <div className="dashboard-tableview">
              <div className="dashboard-tableheader">
                <h2 className="dashboard-tablename">{selectedTable}</h2>
                <span className="dashboard-rowcount">({rowCount} rows)</span>
              </div>
              
              {loading ? (
                <p className="dashboard-loading">Loading table data...</p>
              ) : tableData.columns.length > 0 ? (
                <div className="dashboard-tablecontainer">
                  <table>
                    <thead>
                      <tr>
                        {tableData.columns.map((col) => (
                          <th key={col.name}>
                            <div className="dashboard-columnheader">
                              <span>{col.name}</span>
                              <span className="dashboard-columntype">{col.type}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map((row, idx) => (
                        <tr key={idx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx}>{cell !== null ? String(cell) : 'NULL'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="dashboard-nodata">No data to display</p>
              )}
            </div>
          ) : (
            <div className="dashboard-noselection">
              <p>Select a table to view its data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
