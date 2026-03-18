import React, { useState } from 'react';
import ConnectionForm from './components/ConnectionForm/ConnectionForm';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionData, setConnectionData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleConnect = (data) => {
    setConnectionData(data);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionData(null);
  };

  const handleToggleTheme = () => {
    setIsDarkMode((currentMode) => !currentMode);
  };

  return (
    <div className="App" data-theme={isDarkMode ? 'dark' : 'light'}>
      {isConnected ? (
        <Dashboard 
          connectionData={connectionData} 
          onDisconnect={handleDisconnect}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <ConnectionForm 
          onConnect={handleConnect}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
      )}
    </div>
  );
}

export default App;
