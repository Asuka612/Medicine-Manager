import React, { useState } from 'react';
import DisclaimerModal from '../components/DisclaimerModal';
import '../styles/LoginPage.css'; // Trỏ ra ngoài thư mục styles

export default function LoginPage() {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAccepted) {
      alert("Vui lòng đồng ý với chính sách và giới hạn trách nhiệm y tế trước khi tiếp tục!");
      return;
    }
    console.log("Submitted:", { email, password });
  };

  return (
    <div className="login-container">
      <DisclaimerModal isOpen={!isAccepted} onAccept={() => setIsAccepted(true)} />

      <h2>{isLoginMode ? 'Đăng Nhập - Quản Lý Lịch Dùng Thuốc' : 'Đăng Ký Tài Khoản Quản Trị'}</h2>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Email tài khoản chính:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" className="btn-submit">
          {isLoginMode ? 'Đăng Nhập' : 'Đăng Ký'}
        </button>
      </form>

      <p className="toggle-text">
        {isLoginMode ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{' '}
        <span 
          onClick={() => setIsLoginMode(!isLoginMode)} 
          className="toggle-link"
        >
          {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
        </span>
      </p>
    </div>
  );
}