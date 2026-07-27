import React, { useState } from 'react';
import '../styles/Dashboard.css';

export default function Dashboard() {
  // Dữ liệu mẫu giả lập danh sách lịch uống thuốc hôm nay
  const [schedules, setSchedules] = useState([
    { id: 1, member: 'Ông nội', medication: 'Amlodipin 5mg', time: '08:00', status: 'Pending' },
    { id: 2, member: 'Bé Bông', medication: 'Efferalgan 250mg', time: '12:00', status: 'Taken' },
    { id: 3, member: 'Bản thân', medication: 'Vitamin C', time: '19:00', status: 'Missed' },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setSchedules(schedules.map(item => {
      item.id === id ? { ...item, status: newStatus } : item
    }));
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar / Menu đơn giản */}
      <aside className="sidebar">
        <h2>💊 MediManage</h2>
        <nav>
          <a href="#dashboard" className="active">📊 Tổng quan</a>
          <a href="#family">👨‍👩‍👧‍👦 Thành viên gia đình</a>
          <a href="#medications">📦 Danh mục thuốc</a>
          <a href="#schedules">⏰ Thiết lập lịch</a>
          <a href="#compliance">📈 Tỷ lệ tuân thủ</a>
        </nav>
      </aside>

      {/* Nội dung chính */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Xin chào, Quản trị gia đình</h1>
          <p>Hệ thống giám sát và nhắc nhở lịch dùng thuốc an toàn</p>
        </header>

        {/* Thống kê nhanh */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Thành viên quản lý</h3>
            <p className="stat-number">3</p>
          </div>
          <div className="stat-card">
            <h3>Liều thuốc hôm nay</h3>
            <p className="stat-number">5</p>
          </div>
          <div className="stat-card compliance">
            <h3>Tỷ lệ tuân thủ</h3>
            <p className="stat-number">85%</p>
          </div>
        </div>

        {/* Bảng quản lý lịch trình trong ngày */}
        <div className="schedule-section">
          <h2>⏰ Nhật ký lịch dùng thuốc hôm nay</h2>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Thành viên</th>
                <th>Tên thuốc & Liều lượng</th>
                <th>Khung giờ</th>
                <th>Trạng thái</th>
                <th>Thao tác xác nhận</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.member}</strong></td>
                  <td>{item.medication}</td>
                  <td>{item.time}</td>
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                      {item.status === 'Taken' ? 'Đã uống' : item.status === 'Missed' ? 'Bỏ lỡ' : 'Chờ uống'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-action taken" 
                      onClick={() => handleStatusChange(item.id, 'Taken')}
                    >
                      Đã uống
                    </button>
                    <button 
                      className="btn-action skipped" 
                      onClick={() => handleStatusChange(item.id, 'Skipped')}
                    >
                      Bỏ qua
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}