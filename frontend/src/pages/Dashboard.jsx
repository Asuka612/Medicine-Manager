import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Member from "./Member";
const API_BASE_URL = "http://127.0.0.1:8000";

function Dashboard({ onOpenMember, onOpenJournal, onOpenStatistics }) {
  const adminId = localStorage.getItem("admin_id");

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, []);

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
        throw new Error(
          data.detail || "Không thể thêm thành viên."
        );
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

  const renderSidebar = () => (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        MEDICATION
        <br />
        MANAGER
      </div>

      <nav>
        <button
          className="sidebar-item active"
          type="button"
        >
          Dashboard
        </button>

        <button
          className="sidebar-item"
          type="button"
          onClick={() => setShowMemberForm(false)}
        >
          Thành viên
        </button>

        <button
          className="sidebar-item"
          type="button"
          onClick={onOpenJournal}
        >
          Nhật ký
        </button>

        <button
          className="sidebar-item"
          type="button"
          onClick={onOpenStatistics}
        >
          Thống kê
        </button>

        <button className="sidebar-item" type="button">
          Cài đặt
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
      <div className="header-title">
        MEDICATION MANAGER
      </div>

      <div className="header-user">
        Xin chào, Admin
      </div>
    </header>
  );

  const renderMemberForm = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>THÊM THÀNH VIÊN</h2>

          <button
            type="button"
            className="modal-close"
            onClick={() => setShowMemberForm(false)}
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
          <h1>TỔNG QUAN</h1>

          <div className="overview-cards">
            <div className="overview-card">
              <span className="overview-number">
                {members.length}
              </span>

              <span className="overview-label">
                Thành viên
              </span>
            </div>

            <div className="overview-card">
              <span className="overview-number">
                —
              </span>

              <span className="overview-label">
                Lịch hôm nay
              </span>
            </div>

            <div className="overview-card">
              <span className="overview-number">
                —
              </span>

              <span className="overview-label">
                Tuân thủ
              </span>
            </div>
          </div>
        </section>

        <section className="members-section">
          <div className="section-header">
            <h2>THÀNH VIÊN GIA ĐÌNH</h2>

            <button
              className="primary-button"
              type="button"
              onClick={() => setShowMemberForm(true)}
            >
              + Thêm thành viên
            </button>
          </div>

          {members.length === 0 ? (
            <p>Chưa có thành viên.</p>
          ) : (
            <div className="member-list">
              {members.map((member) => (
                <div
                  className="member-card"
                  key={member.id}
                >
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