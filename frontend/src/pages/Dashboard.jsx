import { useEffect, useState } from "react";
import "../styles/Dashboard.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Dashboard({ onOpenMember, onOpenJournal, onOpenStatistics }) {
  const adminId = localStorage.getItem("admin_id");

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const [memberForm, setMemberForm] = useState({
    email: "",
    password: "",
    full_name: "",
    relationship: "",
    medical_history_encrypted: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("admin_id");
    localStorage.removeItem("adminId");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  useEffect(() => {
    if (!adminId) {
      setError("Không tìm thấy admin_id. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    loadMembers();
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/statistics/?admin_id=${adminId}`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu thống kê.");
      }

      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/members/?admin_id=${adminId}`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách thành viên.");
      }

      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberInput = (e) => {
    const { name, value } = e.target;

    setMemberForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberForm.full_name.trim()) {
      alert("Vui lòng nhập họ tên.");
      return;
    }

    if (!memberForm.email.trim()) {
      alert("Vui lòng nhập email.");
      return;
    }

    if (!memberForm.password.trim()) {
      alert("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/members/?admin_id=${adminId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(memberForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Không thể thêm thành viên.");
      }

      alert("Thêm thành viên thành công.");

      setMemberForm({
        email: "",
        password: "",
        full_name: "",
        relationship: "",
        medical_history_encrypted: "",
      });

      setShowMemberForm(false);

      await loadMembers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const getMemberInitials = (name = "") => {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const renderSidebar = () => (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        <span>MEDICATION</span>
        <span>MANAGER</span>
      </div>

      <nav>
        <button
          className="sidebar-item active"
          type="button"
        >
          <span className="sidebar-item-label">Dashboard</span>
        </button>

        <button
          className="sidebar-item"
          type="button"
          onClick={() => setShowMemberForm(false)}
        >
          <span className="sidebar-item-label">Thành viên</span>
        </button>

        <button
          className="sidebar-item"
          type="button"
          onClick={onOpenJournal}
        >
          <span className="sidebar-item-label">Nhật ký</span>
        </button>

        <button
          className="sidebar-item"
          type="button"
          onClick={onOpenStatistics}
        >
          <span className="sidebar-item-label">Thống kê</span>
        </button>

        <button className="sidebar-item" type="button">
          <span className="sidebar-item-label">Cài đặt</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="logout-button"
        >
          Đăng xuất
        </button>
      </nav>
    </aside>
  );

  const renderHeader = () => (
    <header className="dashboard-header">
      <div className="header-title">MEDICATION MANAGER</div>

      <div className="header-user">
        <span className="header-user-dot" />
        <span>Xin chào, Admin</span>
      </div>
    </header>
  );

  const renderMemberForm = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">QUẢN LÝ GIA ĐÌNH</span>
            <h2>THÊM THÀNH VIÊN</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={() => setShowMemberForm(false)}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={memberForm.email}
                onChange={handleMemberInput}
                placeholder="member@gmail.com"
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>

              <input
                type="password"
                name="password"
                value={memberForm.password}
                onChange={handleMemberInput}
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div className="form-group">
              <label>Họ tên</label>

              <input
                type="text"
                name="full_name"
                value={memberForm.full_name}
                onChange={handleMemberInput}
                placeholder="Nguyễn Văn Bé"
              />
            </div>

            <div className="form-group">
              <label>Quan hệ</label>

              <input
                type="text"
                name="relationship"
                value={memberForm.relationship}
                onChange={handleMemberInput}
                placeholder="Con trai"
              />
            </div>

            <div className="form-group">
              <label>Bệnh sử</label>

              <textarea
                name="medical_history_encrypted"
                value={memberForm.medical_history_encrypted}
                onChange={handleMemberInput}
                placeholder="Nhập bệnh sử..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowMemberForm(false)}
              >
                Hủy
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Lưu thành viên
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => {
    return (
      <>
        <section className="overview-section">
          <div className="section-title-row">
            <div>
              <span className="section-eyebrow">DASHBOARD</span>
              <h1>TỔNG QUAN</h1>
            </div>
            <span className="section-date">Tình trạng gia đình</span>
          </div>

          <div className="overview-cards">
            <div className="overview-card overview-card-members">
              <div className="overview-card-top">
                <span className="overview-icon">01</span>
                <span className="overview-trend">Hồ sơ</span>
              </div>

              <span className="overview-number">{members.length}</span>

              <span className="overview-label">THÀNH VIÊN</span>
              <span className="overview-description">
                Tổng số thành viên trong gia đình
              </span>
            </div>

            <div className="overview-card overview-card-schedules">
              <div className="overview-card-top">
                <span className="overview-icon">02</span>
                <span className="overview-trend">Lịch</span>
              </div>

              <span className="overview-number">
                {statistics?.overview?.total_schedules ?? 0}
              </span>

              <span className="overview-label">TỔNG LỊCH UỐNG</span>
              <span className="overview-description">
                Lịch dùng thuốc đang được quản lý
              </span>
            </div>

            <div className="overview-card overview-card-compliance">
              <div className="overview-card-top">
                <span className="overview-icon">03</span>
                <span className="overview-trend">Theo dõi</span>
              </div>

              <span className="overview-number">
                {statistics?.overview?.overall_compliance ?? 0}%
              </span>

              <span className="overview-label">TUÂN THỦ</span>
              <span className="overview-description">
                Mức độ hoàn thành lịch uống thuốc
              </span>
            </div>
          </div>
        </section>

        <section className="members-section">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">FAMILY</span>
              <h2>THÀNH VIÊN GIA ĐÌNH</h2>
            </div>

            <button
              className="primary-button add-member-button"
              type="button"
              onClick={() => setShowMemberForm(true)}
            >
              + Thêm thành viên
            </button>
          </div>

          {members.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">+</div>
              <h3>Chưa có thành viên</h3>
              <p>Thêm thành viên để bắt đầu quản lý lịch dùng thuốc.</p>
            </div>
          ) : (
            <div className="member-list">
              {members.map((member) => (
                <div
                  className="member-card"
                  key={member.id}
                >
                  <div className="member-avatar">
                    {getMemberInitials(member.full_name)}
                  </div>

                  <div className="member-info">
                    <h3>{member.full_name}</h3>

                    <p>
                      {member.relationship || "Chưa cập nhật"}
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => onOpenMember(member)}
                  >
                    Quản lý
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {showMemberForm && renderMemberForm()}
      </>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {renderSidebar()}

      <main className="dashboard-main">
        {renderHeader()}

        <div className="dashboard-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {renderOverview()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;