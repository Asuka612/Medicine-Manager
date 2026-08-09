import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MemberDashboard from "./pages/MemberDashboard";
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="app-container">
      {!user ? (
        <LoginPage />
      ) : user.role === "MEMBER" ? (
        <MemberDashboard />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}