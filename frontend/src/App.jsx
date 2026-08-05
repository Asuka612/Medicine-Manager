import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Nếu chưa đăng nhập thì hiện trang Login, đăng nhập rồi thì hiện Dashboard
  return (
    <div className="app-container">
      {!user ? <LoginPage /> : <Dashboard />}
    </div>
  );
}