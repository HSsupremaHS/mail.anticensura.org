import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard AntiCensura Email</h1>
      <nav>
        <Link to="/accounts">Gestione Account</Link>
        <Link to="/inbox">Inbox</Link>
        <Link to="/compose">Scrivi Email</Link>
      </nav>
    </div>
  );
};

export default Dashboard;