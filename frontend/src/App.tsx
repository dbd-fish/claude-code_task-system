import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { healthCheck, testConnection } from './services/api';

function App() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [backendMessage, setBackendMessage] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{email: string} | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const healthResponse = await healthCheck();
        const testResponse = await testConnection();
        
        setConnectionStatus('Connected');
        setBackendMessage(testResponse.message || 'Connection successful');
      } catch (error) {
        setConnectionStatus('Failed');
        setBackendMessage('Backend connection failed');
        console.error('Connection error:', error);
      }
    };

    checkConnection();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      // TODO: 実際のAPIコールをここに実装
      console.log('Login attempt:', { email, password });
      
      // 仮のログイン処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser({ email });
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      user={user!} 
      onLogout={handleLogout} 
    />
  );
}

export default App;