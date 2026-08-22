import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "../styles/MemberDashboard.css";

const API_BASE_URL = "http://127.0.0.1:8000";



function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  switch (status) {
    case "Taken":
      return "Đã uống";

    case "Skipped":
      return "Đã bỏ qua";

    case "Missed":
      return "Quên uống";

    case "Pending":
      return "Chờ xử lý";

    default:
      return status;
  }
}

function getStatusClass(status) {
  switch (status) {
    case "Taken":
      return "taken";

    case "Skipped":
      return "skipped";

    case "Missed":
      return "missed";

    case "Pending":
      return "pending";

    default:
      return "";
  }
}

function isSameDay(dateString, targetDate) {
  const date = new Date(dateString);

  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getDate() === targetDate.getDate()
  );
}

export default function MemberDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [processingLogId, setProcessingLogId] = useState(null);
  const [userId, setUserId] = useState(null);
  const loadDashboard = useCallback(
    async (showLoader = false) => {
      if (!userId) {
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/member-dashboard/user/${userId}`
        );

        if (!response.ok) {
          throw new Error(
            "Không thể tải dữ liệu dashboard thành viên."
          );
        }

        const result = await response.json();

        setData(result);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );
  useEffect(() => {
    if (userId) {
      loadDashboard(true);
    }
  }, [userId, loadDashboard]);
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setError("Không tìm thấy thông tin tài khoản.");
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (!user.id) {
        throw new Error("Không tìm thấy user ID.");
      }

      setUserId(user.id);
    } catch (err) {
      console.error(err);
      setError("Dữ liệu tài khoản không hợp lệ.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleLogAction = async (logId, action) => {
    if (processingLogId === logId) {
      return;
    }

    try {
      setProcessingLogId(logId);

      const response = await fetch(
        `${API_BASE_URL}/api/schedules/logs/${logId}/${action}?family_member_id=${data.member.id}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
          result.message ||
          "Không thể cập nhật trạng thái."
        );
      }

      await loadDashboard(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setProcessingLogId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("adminId");

    window.location.href = "/login";
  };

  const schedules = data?.schedules || [];
  const logs = data?.logs || [];

  const today = new Date();

  const todayLogs = useMemo(() => {
    return logs
      .filter((log) => isSameDay(log.scheduled_time, today))
      .sort(
        (a, b) =>
          new Date(a.scheduled_time) -
          new Date(b.scheduled_time)
      );
  }, [logs]);

  const takenCount = logs.filter(
    (log) => log.status === "Taken"
  ).length;

  const pendingCount = logs.filter(
    (log) => log.status === "Pending"
  ).length;

  const missedCount = logs.filter(
    (log) => log.status === "Missed"
  ).length;

  const skippedCount = logs.filter(
    (log) => log.status === "Skipped"
  ).length;

  const getScheduleName = (scheduleId) => {
    const schedule = schedules.find(
      (item) => item.id === scheduleId
    );

    return schedule?.medication_name || "Thuốc";
  };

  const getScheduleDosage = (scheduleId) => {
    const schedule = schedules.find(
      (item) => item.id === scheduleId
    );

    return schedule?.dosage || "";
  };

  const canTakeOrSkip = (log) => {
    if (log.status !== "Pending") {
      return false;
    }

    const scheduledTime = new Date(log.scheduled_time);
    const now = new Date();

    return now >= scheduledTime;
  };

  const renderStatusBadge = (status) => (
    <span
      className={`member-status-badge ${getStatusClass(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );

  const renderSidebar = () => (
    <aside className="member-sidebar">
      <div className="member-sidebar-logo">
        MEDICATION
        <br />
        MANAGER
      </div>

      <div className="member-sidebar-title">
        TÀI KHOẢN THÀNH VIÊN
      </div>

      <nav className="member-sidebar-nav">
        <button
          type="button"
          className={`member-sidebar-item ${activeTab === "dashboard" ? "active" : ""
            }`}
          onClick={() => setActiveTab("dashboard")}
        >
          <span>⌂</span>
          Dashboard
        </button>

        <button
          type="button"
          className={`member-sidebar-item ${activeTab === "schedule" ? "active" : ""
            }`}
          onClick={() => setActiveTab("schedule")}
        >
          <span>▣</span>
          Lịch uống thuốc
        </button>

        <button
          type="button"
          className={`member-sidebar-item ${activeTab === "profile" ? "active" : ""
            }`}
          onClick={() => setActiveTab("profile")}
        >
          <span>○</span>
          Thông tin cá nhân
        </button>
      </nav>

      <button
        type="button"
        className="member-logout-button"
        onClick={handleLogout}
      >
        Đăng xuất
      </button>
    </aside>
  );

  const renderHeader = () => (
    <header className="member-header">
      <div>
        <div className="member-header-title">
          {activeTab === "dashboard" && "DASHBOARD"}
          {activeTab === "schedule" && "LỊCH UỐNG THUỐC"}
          {activeTab === "profile" && "THÔNG TIN CÁ NHÂN"}
        </div>

        <div className="member-header-subtitle">
          Quản lý lịch dùng thuốc của bạn
        </div>
      </div>

      <div className="member-header-user">
        <div className="member-avatar">
          {data?.member?.full_name?.charAt(0)?.toUpperCase() ||
            "M"}
        </div>

        <div>
          <strong>{data?.member?.full_name}</strong>
          <span>Thành viên</span>
        </div>
      </div>
    </header>
  );

  const renderOverview = () => (
    <>
      <section className="member-welcome-card">
        <div>
          <div className="member-welcome-label">
            HÔM NAY
          </div>

          <h1>
            Xin chào, {data.member.full_name}
          </h1>

          <p>
            Theo dõi các liều thuốc và cập nhật trạng thái
            uống thuốc của bạn.
          </p>
        </div>

        <div className="member-week-box">
          <span>Tuần hiện tại</span>
          <strong>
            {data.week.start} → {data.week.end}
          </strong>
        </div>
      </section>

      <section className="member-stat-grid">
        <div className="member-stat-card">
          <div className="member-stat-icon blue">
            ▣
          </div>

          <div>
            <strong>{todayLogs.length}</strong>
            <span>Liều hôm nay</span>
          </div>
        </div>

        <div className="member-stat-card">
          <div className="member-stat-icon green">
            ✓
          </div>

          <div>
            <strong>{takenCount}</strong>
            <span>Đã uống trong tuần</span>
          </div>
        </div>

        <div className="member-stat-card">
          <div className="member-stat-icon orange">
            !
          </div>

          <div>
            <strong>{pendingCount}</strong>
            <span>Đang chờ</span>
          </div>
        </div>

        <div className="member-stat-card">
          <div className="member-stat-icon red">
            ×
          </div>

          <div>
            <strong>{missedCount}</strong>
            <span>Quên uống</span>
          </div>
        </div>
      </section>

      <section className="member-panel">
        <div className="member-panel-header">
          <div>
            <h2>LỊCH HÔM NAY</h2>
            <p>
              Chỉ có thể xác nhận sau khi đến giờ uống.
            </p>
          </div>

          <button
            type="button"
            className="member-refresh-button"
            onClick={() => loadDashboard(false)}
          >
            {refreshing ? "Đang tải..." : "↻ Làm mới"}
          </button>
        </div>

        {todayLogs.length === 0 ? (
          <div className="member-empty-state">
            <div className="member-empty-icon">
              ✓
            </div>

            <h3>Hôm nay chưa có liều thuốc</h3>

            <p>
              Bạn hiện không có lịch uống thuốc nào trong
              ngày hôm nay.
            </p>
          </div>
        ) : (
          <div className="member-dose-list">
            {todayLogs.map((log) => {
              const canAction = canTakeOrSkip(log);

              return (
                <div
                  className={`member-dose-card ${log.status === "Pending" && canAction
                    ? "ready"
                    : ""
                    }`}
                  key={log.id}
                >
                  <div className="member-dose-time">
                    <strong>
                      {new Date(
                        log.scheduled_time
                      ).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>

                    <span>
                      {formatDateTime(
                        log.scheduled_time
                      )}
                    </span>
                  </div>

                  <div className="member-dose-info">
                    <h3>
                      {getScheduleName(
                        log.schedule_id
                      )}
                    </h3>

                    <p>
                      {getScheduleDosage(
                        log.schedule_id
                      )}
                    </p>
                  </div>

                  <div className="member-dose-action">
                    {renderStatusBadge(log.status)}

                    {log.status === "Pending" && (
                      <div className="member-action-buttons">
                        <button
                          type="button"
                          className="member-take-button"
                          disabled={
                            !canAction ||
                            processingLogId === log.id
                          }
                          onClick={() =>
                            handleLogAction(
                              log.id,
                              "take"
                            )
                          }
                        >
                          {processingLogId === log.id
                            ? "..."
                            : "✓ Đã uống"}
                        </button>

                        <button
                          type="button"
                          className="member-skip-button"
                          disabled={
                            !canAction ||
                            processingLogId === log.id
                          }
                          onClick={() =>
                            handleLogAction(
                              log.id,
                              "skip"
                            )
                          }
                        >
                          Bỏ qua
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="member-panel">
        <div className="member-panel-header">
          <div>
            <h2>THỐNG KÊ TUẦN</h2>
            <p>
              Tổng hợp tình trạng uống thuốc trong tuần.
            </p>
          </div>
        </div>

        <div className="member-week-stats">
          <div>
            <strong>{takenCount}</strong>
            <span>Đã uống</span>
          </div>

          <div>
            <strong>{skippedCount}</strong>
            <span>Bỏ qua</span>
          </div>

          <div>
            <strong>{missedCount}</strong>
            <span>Quên uống</span>
          </div>

          <div>
            <strong>
              {logs.length > 0
                ? Math.round(
                  (takenCount / logs.length) * 100
                )
                : 0}
              %
            </strong>
            <span>Tỷ lệ hoàn thành</span>
          </div>
        </div>
      </section>
    </>
  );

  const renderSchedulePage = () => (
    <section className="member-panel">
      <div className="member-panel-header">
        <div>
          <h2>LỊCH UỐNG THUỐC</h2>

          <p>
            Thông tin các lịch uống thuốc đang được áp dụng.
          </p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="member-empty-state">
          <div className="member-empty-icon">
            ▣
          </div>

          <h3>Chưa có lịch uống thuốc</h3>

          <p>
            Hiện chưa có lịch uống thuốc nào được thiết lập.
          </p>
        </div>
      ) : (
        <div className="member-schedule-grid">
          {schedules.map((schedule) => (
            <div
              className="member-schedule-card"
              key={schedule.id}
            >
              <div className="member-schedule-top">
                <div>
                  <span className="member-schedule-label">
                    THUỐC
                  </span>

                  <h3>
                    {schedule.medication_name}
                  </h3>
                </div>

                <span className="member-schedule-id">
                  #{schedule.id}
                </span>
              </div>

              <div className="member-schedule-details">
                <div>
                  <span>Liều lượng</span>
                  <strong>
                    {schedule.dosage || "—"}
                  </strong>
                </div>

                <div>
                  <span>Giờ uống</span>
                  <strong>
                    {schedule.reminder_times?.join(
                      " • "
                    ) || "—"}
                  </strong>
                </div>

                <div>
                  <span>Chu kỳ</span>
                  <strong>
                    {schedule.frequency_days === 1
                      ? "Mỗi ngày"
                      : `Mỗi ${schedule.frequency_days} ngày`}
                  </strong>
                </div>

                <div>
                  <span>Thời gian</span>
                  <strong>
                    {schedule.start_date}
                    {" → "}
                    {schedule.end_date || "Không giới hạn"}
                  </strong>
                </div>
              </div>

              {schedule.notification_message && (
                <div className="member-schedule-message">
                  <span>Nhắc nhở</span>
                  <p>
                    {schedule.notification_message}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const renderProfilePage = () => (
    <section className="member-profile-grid">
      <div className="member-profile-main">
        <div className="member-profile-avatar">
          {data.member.full_name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <h2>{data.member.full_name}</h2>

        <p>Thành viên gia đình</p>

        <div className="member-profile-fields">
          <div>
            <span>Họ tên</span>
            <strong>
              {data.member.full_name}
            </strong>
          </div>

          <div>
            <span>Quan hệ</span>
            <strong>
              {data.member.relationship || "Chưa cập nhật"}
            </strong>
          </div>

          <div>
            <span>Family Member ID</span>
            <strong>{data.member.id}</strong>
          </div>

          <div>
            <span>User ID</span>
            <strong>{data.member.member_id}</strong>
          </div>
        </div>
      </div>

      <div className="member-profile-note">
        <h3>THÔNG TIN</h3>

        <p>
          Đây là trang thông tin cá nhân của tài khoản
          thành viên.
        </p>

        <p>
          Các thông tin tài khoản được quản lý bởi Admin
          của gia đình.
        </p>
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="member-loading">
        <div className="member-loading-card">
          <div className="member-loading-spinner" />
          <p>Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="member-loading">
        <div className="member-error-card">
          <h2>Không thể tải dashboard</h2>
          <p>{error}</p>

          <button
            type="button"
            className="member-retry-button"
            onClick={() => loadDashboard(true)}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="member-dashboard">
      {renderSidebar()}

      <main className="member-main">
        {renderHeader()}

        <div className="member-content">
          {activeTab === "dashboard" &&
            renderOverview()}

          {activeTab === "schedule" &&
            renderSchedulePage()}

          {activeTab === "profile" &&
            renderProfilePage()}
        </div>
      </main>
    </div>
  );
}