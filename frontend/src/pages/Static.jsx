import { useEffect, useState } from "react";
import "../styles/Static.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Static({ onBack }) {
  const adminId = localStorage.getItem("admin_id");

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError("");

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminId) {
      setError("Không tìm thấy admin_id.");
      setLoading(false);
      return;
    }

    loadStatistics();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Đang tải thống kê...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          MEDICATION
          <br />
          MANAGER
        </div>

        <nav>
          <button
            className="sidebar-item"
            type="button"
            onClick={onBack}
          >
            ← Dashboard
          </button>

          <button className="sidebar-item" type="button">
            Thành viên
          </button>

          <button className="sidebar-item" type="button">
            Nhật ký
          </button>

          <button
            className="sidebar-item active"
            type="button"
          >
            Thống kê
          </button>

          <button className="sidebar-item" type="button">
            Cài đặt
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            THỐNG KÊ
          </div>

          <div className="header-user">
            Xin chào, Admin
          </div>
        </header>

        <div className="dashboard-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {statistics && (
            <>
              <section className="statistics-overview">
                <div className="statistics-card">
                  <span className="statistics-number">
                    {statistics.overview.total_members}
                  </span>

                  <span className="statistics-label">
                    Thành viên
                  </span>
                </div>

                <div className="statistics-card">
                  <span className="statistics-number">
                    {statistics.overview.total_medications}
                  </span>

                  <span className="statistics-label">
                    Loại thuốc
                  </span>
                </div>

                <div className="statistics-card">
                  <span className="statistics-number">
                    {statistics.overview.total_schedules}
                  </span>

                  <span className="statistics-label">
                    Lịch uống
                  </span>
                </div>

                <div className="statistics-card">
                  <span className="statistics-number">
                    {statistics.overview.overall_compliance}%
                  </span>

                  <span className="statistics-label">
                    Tuân thủ
                  </span>
                </div>
              </section>

              <section className="statistics-section">
                <div className="statistics-section-header">
                  <h2>
                    TUÂN THỦ THEO THÀNH VIÊN
                  </h2>
                </div>

                {statistics.member_compliance.length === 0 ? (
                  <p className="statistics-empty">
                    Chưa có dữ liệu.
                  </p>
                ) : (
                  <div className="compliance-list">
                    {statistics.member_compliance.map(
                      (member) => (
                        <div
                          className="compliance-item"
                          key={member.member_id}
                        >
                          <div className="compliance-info">
                            <strong>
                              {member.member_name}
                            </strong>

                            <span>
                              {member.compliance_rate}%
                            </span>
                          </div>

                          <div className="compliance-bar">
                            <div
                              className="compliance-fill"
                              style={{
                                width: `${Math.min(
                                  member.compliance_rate,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              <section className="statistics-section">
                <div className="statistics-section-header">
                  <h2>
                    THUỐC SẮP HẾT
                  </h2>
                </div>

                {statistics.low_stock_medications.length ===
                0 ? (
                  <p className="statistics-empty">
                    Không có thuốc nào dưới ngưỡng tồn kho.
                  </p>
                ) : (
                  <div className="low-stock-list">
                    {statistics.low_stock_medications.map(
                      (medication) => (
                        <div
                          className="low-stock-card"
                          key={medication.medication_id}
                        >
                          <div>
                            <h3>
                              {medication.medication_name}
                            </h3>

                            <p>
                              Thành viên:{" "}
                              {medication.member_name}
                            </p>
                          </div>

                          <div className="low-stock-value">
                            <strong>
                              {medication.stock_quantity}
                            </strong>

                            <span>
                              / {medication.min_threshold}
                            </span>

                            <small>
                              tồn / ngưỡng
                            </small>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Static;