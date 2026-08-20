import React, { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import MemberDashboard from "./pages/MemberDashboard";
import Member from "./pages/Member";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // =========================
  // CHƯA ĐĂNG NHẬP
  // =========================

  if (!user) {
    return (
      <div className="app-container">
        <LoginPage />
      </div>
    );
  }

  // =========================
  // MEMBER ACCOUNT
  // =========================

  if (user.role === "MEMBER") {
    return (
      <div className="app-container">
        <MemberDashboard />
      </div>
    );
  }

  // =========================
  // ADMIN
  // =========================

  return (
    <div className="app-container">

      {selectedMember ? (
        <Member
          member={selectedMember}
          onBack={() => setSelectedMember(null)}
        />
      ) : (
        <Dashboard
          onOpenMember={(member) => {
            console.log("Đang mở member:", member);
            setSelectedMember(member);
          }}
        />
      )}

    </div>
  );
}