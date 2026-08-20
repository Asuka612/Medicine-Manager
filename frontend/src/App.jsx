import React, { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import MemberDashboard from "./pages/MemberDashboard";
import Member from "./pages/Member";
import Journal from "./pages/Journal";
import "./App.css";
import Static from "./pages/Static";
export default function App() {
  const [user, setUser] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showJournal, setShowJournal] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  // CHƯA ĐĂNG NHẬP
  if (!user) {
    return (
      <div className="app-container">
        <LoginPage />
      </div>
    );
  }
  // MEMBER ACCOUNT
  if (user.role === "MEMBER") {
    return (
      <div className="app-container">
        <MemberDashboard />
      </div>
    );
  }
  // ADMIN

  return (
    <div className="app-container">

      {showStatistics ? (
        <Static
          onBack={() => setShowStatistics(false)}
        />
      ) : showJournal ? (
        <Journal
          onBack={() => setShowJournal(false)}
        />
      ) : selectedMember ? (
        <Member
          member={selectedMember}
          onBack={() => setSelectedMember(null)}
        />
      ) : (
        <Dashboard
          onOpenMember={(member) => {
            setSelectedMember(member);
            setShowJournal(false);
            setShowStatistics(false);
          }}
          onOpenJournal={() => {
            setSelectedMember(null);
            setShowStatistics(false);
            setShowJournal(true);
          }}
          onOpenStatistics={() => {
            setSelectedMember(null);
            setShowJournal(false);
            setShowStatistics(true);
          }}
        />
      )}

    </div>
  );
}