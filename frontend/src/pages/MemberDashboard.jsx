import React, { useEffect, useState } from "react";
import "../styles/MemberDashboard.css";
export default function MemberDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Demo: FamilyMember có id = 1
  const familyMemberId = 1;

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/member-dashboard/${familyMemberId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Không thể tải dữ liệu dashboard");
        }
        return res.json();
      })
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Đang tải dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-main">
          <div className="dashboard-content">
            <div className="error-message">
              {error}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const schedules = data.schedules || [];
  const logs = data.logs || [];

  const takenCount = logs.filter(
    (log) => log.status === "Taken"
  ).length;

  const pendingCount = logs.filter(
    (log) => log.status === "Pending"
  ).length;

  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">

        <div className="sidebar-logo">
          Medicine Manager
        </div>

        <nav>
          <button className="sidebar-item active">
            Dashboard
          </button>

          <button className="sidebar-item">
            Lịch uống thuốc
          </button>

          <button className="sidebar-item">
            Thuốc của tôi
          </button>
        </nav>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("user");
            window.location.reload();
          }}
        >
          Đăng xuất
        </button>

      </aside>


      {/* MAIN */}
      <main className="dashboard-main">

        {/* HEADER */}
        <header className="dashboard-header">
          <div className="header-title">
            Member Dashboard
          </div>

          <div className="header-user">
            Xin chào, {data.member.full_name}
          </div>
        </header>


        {/* CONTENT */}
        <div className="dashboard-content">

          {/* MEMBER INFO */}
          <section className="overview-section">

            <h1>
              Xin chào, {data.member.full_name}
            </h1>

            <div className="overview-cards">

              <div className="overview-card">
                <div className="overview-number">
                  {schedules.length}
                </div>

                <div className="overview-label">
                  Lịch uống thuốc
                </div>
              </div>


              <div className="overview-card">
                <div className="overview-number">
                  {takenCount}
                </div>

                <div className="overview-label">
                  Đã uống
                </div>
              </div>


              <div className="overview-card">
                <div className="overview-number">
                  {pendingCount}
                </div>

                <div className="overview-label">
                  Chưa uống
                </div>
              </div>

            </div>
          </section>


          {/* MEMBER PROFILE */}
          <section className="member-profile">

            <h2>Thông tin thành viên</h2>

            <p>
              <strong>Họ tên:</strong>{" "}
              {data.member.full_name}
            </p>

            <p>
              <strong>Quan hệ:</strong>{" "}
              {data.member.relationship}
            </p>

          </section>


          {/* MEDICATION / SCHEDULE */}
          <section className="schedule-section">

            <div className="section-header">
              <h2>Lịch uống thuốc</h2>

              <span>
                {data.week.start} → {data.week.end}
              </span>
            </div>


            {schedules.length === 0 ? (
              <p>Chưa có lịch uống thuốc.</p>
            ) : (

              <div className="schedule-list">

                {schedules.map((schedule) => (

                  <div
                    className="schedule-card"
                    key={schedule.id}
                  >

                    <h3>
                      {schedule.medication_name}
                    </h3>

                    <p>
                      <strong>Liều lượng:</strong>{" "}
                      {schedule.dosage}
                    </p>

                    <p>
                      <strong>Giờ uống:</strong>{" "}
                      {schedule.reminder_times?.join(", ") ||
                        "Chưa có"}
                    </p>

                    <p>
                      <strong>Bắt đầu:</strong>{" "}
                      {schedule.start_date}
                    </p>

                    {schedule.end_date && (
                      <p>
                        <strong>Kết thúc:</strong>{" "}
                        {schedule.end_date}
                      </p>
                    )}

                    {schedule.notification_message && (
                      <p>
                        <strong>Thông báo:</strong>{" "}
                        {schedule.notification_message}
                      </p>
                    )}

                  </div>

                ))}

              </div>

            )}

          </section>


          {/* LOGS */}
          <section className="schedule-section">

            <div className="section-header">
              <h2>Lịch sử uống thuốc</h2>
            </div>

            {logs.length === 0 ? (

              <p>
                Chưa có dữ liệu uống thuốc trong tuần này.
              </p>

            ) : (

              <div className="schedule-list">

                {logs.map((log) => (

                  <div
                    className="schedule-card"
                    key={log.id}
                  >

                    <p>
                      <strong>Schedule:</strong>{" "}
                      {log.schedule_id}
                    </p>

                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      {log.status}
                    </p>

                    <p>
                      <strong>Thời gian:</strong>{" "}
                      {log.scheduled_time}
                    </p>

                    {log.action_time && (
                      <p>
                        <strong>Thời gian thực hiện:</strong>{" "}
                        {log.action_time}
                      </p>
                    )}

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}