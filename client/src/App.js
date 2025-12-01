import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import AccountManagement from './components/accounts/AccountManagement';
import Inbox from './components/email/Inbox';
import Compose from './components/email/Compose';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/accounts" 
          element={isAuthenticated ? <AccountManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/inbox/:accountId" 
          element={isAuthenticated ? <Inbox /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/compose" 
          element={isAuthenticated ? <Compose /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;