import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
const API_BASE_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const adminId = localStorage.getItem("admin_id");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [medications, setMedications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [compliance, setCompliance] = useState(0);
  // =========================================================
  // MEMBER FORM
  // =========================================================
  const handleLogout = () => {
    // Xóa thông tin đăng nhập đang lưu
    localStorage.removeItem("adminId");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Quay về trang đăng nhập
    window.location.href = "/login";
  };
  const [memberForm, setMemberForm] = useState({
    email: "",
    password: "",
    full_name: "",
    relationship: "",
    medical_history_encrypted: "",
  });

  // =========================================================
  // MEDICATION FORM
  // =========================================================

  const [medicationForm, setMedicationForm] = useState({
    family_member_id: "",
    name: "",
    dosage: "",
    stock_quantity: 0,
    min_threshold: 5,
    expiry_date: "",
  });

  // =========================================================
  // SCHEDULE FORM
  // =========================================================

  const [scheduleForm, setScheduleForm] = useState({
    family_member_id: "",
    medication_id: "",
    frequency_days: 1,
    reminder_times: ["08:00"],
    start_date: "",
    end_date: "",
    reminder_before_minutes: 10,
    notification_message: " Đến giờ uống thuốc",
  });

  // =========================================================
  // CHECK ADMIN
  // =========================================================

  useEffect(() => {
    if (!adminId) {
      setError(
        "Không tìm thấy admin_id. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      return;
    }

    loadMembers();
  }, []);

  // =========================================================
  // LOAD MEMBERS
  // =========================================================

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

  // =========================================================
  // LOAD MEMBER DATA
  // =========================================================

  const loadMemberData = async (member) => {
    try {
      setLoading(true);
      setError("");

      const memberId = member.id;

      const [medicationResponse, scheduleResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/api/medications/member/${memberId}?admin_id=${adminId}`
          ),

          fetch(
            `${API_BASE_URL}/api/schedules/member/${memberId}?admin_id=${adminId}`
          ),
        ]);

      if (!medicationResponse.ok) {
        throw new Error("Không thể lấy danh sách thuốc.");
      }

      if (!scheduleResponse.ok) {
        throw new Error("Không thể lấy danh sách lịch uống.");
      }

      const medicationData = await medicationResponse.json();
      const scheduleData = await scheduleResponse.json();

      setMedications(medicationData);
      setSchedules(scheduleData);

      setSelectedMember(member);

      loadCompliance(memberId);

      setCurrentPage("member");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // LOAD COMPLIANCE
  const loadCompliance = async (memberId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/schedules/compliance/${memberId}`
      );
      if (!response.ok) {
        setCompliance(0);
        return;
      }
      const data = await response.json();
      if (typeof data === "number") {
        setCompliance(data);
      } else if (data.compliance_rate !== undefined) {
        setCompliance(data.compliance_rate);
      } else if (data.compliance !== undefined) {
        setCompliance(data.compliance);
      } else if (data.rate !== undefined) {
        setCompliance(data.rate);
      } else {
        setCompliance(0);
      }
    } catch (err) {
      console.error("Compliance error:", err);
      setCompliance(0);
    }
  };
  // MEMBER FORM
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
  // MEDICATION FORM
  const handleMedicationInput = (e) => {
    const { name, value } = e.target;

    setMedicationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();

    if (!selectedMember) {
      alert("Chưa chọn thành viên.");
      return;
    }

    if (!medicationForm.name.trim()) {
      alert("Vui lòng nhập tên thuốc.");
      return;
    }

    try {
      const payload = {
        family_member_id: selectedMember.id,
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        stock_quantity: Number(
          medicationForm.stock_quantity
        ),
        min_threshold: Number(
          medicationForm.min_threshold
        ),
        expiry_date:
          medicationForm.expiry_date || null,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/medications/?admin_id=${adminId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Không thể thêm thuốc."
        );
      }

      alert("Thêm thuốc thành công.");

      setMedicationForm({
        family_member_id: selectedMember.id,
        name: "",
        dosage: "",
        stock_quantity: 0,
        min_threshold: 5,
        expiry_date: "",
      });

      setShowMedicationForm(false);

      await loadMemberData(selectedMember);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  // SCHEDULE FORM
  const handleScheduleInput = (e) => {
    const { name, value } = e.target;

    setScheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleScheduleMemberChange = async (e) => {
    const memberId = Number(e.target.value);
    const member = members.find(
      (item) => item.id === memberId
    );

    if (!member) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medications/member/${memberId}?admin_id=${adminId}`
      );

      if (!response.ok) {
        throw new Error(
          "Không thể lấy danh sách thuốc."
        );
      }

      const data = await response.json();

      setMedications(data);

      setScheduleForm((prev) => ({
        ...prev,
        family_member_id: memberId,
        medication_id: data[0]?.id || "",
      }));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleScheduleMedicationChange = (e) => {
    setScheduleForm((prev) => ({
      ...prev,
      medication_id: Number(e.target.value),
    }));
  };
  // REMINDER TIMES
  const handleReminderTimeChange = (
    index,
    value
  ) => {
    setScheduleForm((prev) => {
      const times = [...prev.reminder_times];

      times[index] = value;

      return {
        ...prev,
        reminder_times: times,
      };
    });
  };

  const addReminderTime = () => {
    setScheduleForm((prev) => ({
      ...prev,
      reminder_times: [
        ...prev.reminder_times,
        "08:00",
      ],
    }));
  };

  const removeReminderTime = (index) => {
    if (scheduleForm.reminder_times.length === 1) {
      return;
    }

    setScheduleForm((prev) => ({
      ...prev,
      reminder_times:
        prev.reminder_times.filter(
          (_, i) => i !== index
        ),
    }));
  };
  // CREATE SCHEDULE
  const handleAddSchedule = async (e) => {
    e.preventDefault();

    if (!selectedMember) {
      alert("Chưa chọn thành viên.");
      return;
    }

    if (!scheduleForm.medication_id) {
      alert("Vui lòng chọn thuốc.");
      return;
    }

    if (!scheduleForm.start_date) {
      alert("Vui lòng chọn ngày bắt đầu.");
      return;
    }

    try {
      const payload = {
        family_member_id: selectedMember.id,
        medication_id: Number(scheduleForm.medication_id),
        frequency_days: Number(scheduleForm.frequency_days),
        weekdays: [],
        reminder_times: scheduleForm.reminder_times,
        start_date: scheduleForm.start_date,
        end_date: scheduleForm.end_date || null,
        reminder_before_minutes: Number(
          scheduleForm.reminder_before_minutes
        ),
        notification_message: scheduleForm.notification_message,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/schedules/?admin_id=${adminId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Lỗi tạo lịch:", data);

        const message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);

        throw new Error(
          message || "Không thể tạo lịch."
        );
      }


      alert("Tạo lịch thành công.");

      setScheduleForm({
        family_member_id: selectedMember.id,
        medication_id: "",
        frequency_days: 1,
        reminder_times: ["08:00"],
        start_date: "",
        end_date: "",
        reminder_before_minutes: 10,
        notification_message:
          " Đến giờ uống thuốc",
      });

      setShowScheduleForm(false);

      await loadMemberData(selectedMember);
      await loadMembers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // =========================================================
  // OPEN MEMBER
  // =========================================================

  const openMemberDetail = (member) => {
    setShowMedicationForm(false);
    setShowScheduleForm(false);

    loadMemberData(member);
  };

  // =========================================================
  // BACK
  // =========================================================

  const backToDashboard = async () => {
    setSelectedMember(null);
    setMedications([]);
    setSchedules([]);
    setShowMedicationForm(false);
    setShowScheduleForm(false);
    setCurrentPage("dashboard");

    await loadMembers();
  };

  // =========================================================
  // OPEN CREATE SCHEDULE
  // =========================================================

  const openScheduleForm = () => {
    if (!selectedMember) {
      return;
    }

    setScheduleForm({
      family_member_id: selectedMember.id,
      medication_id:
        medications[0]?.id || "",
      frequency_days: 1,
      reminder_times: ["08:00"],
      start_date: "",
      end_date: "",
      reminder_before_minutes: 10,
      notification_message:
        " Đến giờ uống thuốc",
    });

    setShowScheduleForm(true);
  };

  // =========================================================
  // SIDEBAR
  // =========================================================

  const renderSidebar = () => (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        MEDICATION
        <br />
        MANAGER
      </div>

      <nav>
        <button
          className={
            currentPage === "dashboard"
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={backToDashboard}
        >
          Dashboard
        </button>

        <button
          className="sidebar-item"
          onClick={backToDashboard}
        >
          Thành viên
        </button>
        <button className="sidebar-item">
          Nhật ký
        </button>

        <button className="sidebar-item">
          Thống kê
        </button>

        <button className="sidebar-item">
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
  // HEADER
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
  // DASHBOARD OVERVIEW
  const renderOverview = () => {
    const totalSchedules = members.reduce(
      (total, member) => {
        return total + 0;
      },
      0
    );

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
                Member
              </span>
            </div>

            <div className="overview-card">
              <span className="overview-number">
                {totalSchedules}
              </span>

              <span className="overview-label">
                Lịch hôm nay
              </span>
            </div>

            <div className="overview-card">
              <span className="overview-number">
                {compliance}%
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
              onClick={() =>
                setShowMemberForm(true)
              }
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
                    <h3>
                      {member.full_name}
                    </h3>

                    <p>
                      {member.relationship}
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      openMemberDetail(member)
                    }
                  >
                    Quản lý
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {showMemberForm &&
          renderMemberForm()}
      </>
    );
  };

  // =========================================================
  // ADD MEMBER
  // =========================================================

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
            {/* GIỮ NGUYÊN TOÀN BỘ phần form hiện tại của bạn ở đây */}

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

  // =========================================================
  // MEMBER DETAIL
  // =========================================================

  const renderMemberDetail = () => {
    if (!selectedMember) {
      return null;
    }

    return (
      <>
        <div className="member-detail-header">
          <button
            className="back-button"
            onClick={backToDashboard}
          >
            ← Thành viên:{" "}
            {selectedMember.full_name}
          </button>
        </div>

        <section className="member-detail">
          <div className="member-profile">
            <h2>THÔNG TIN</h2>

            <p>
              <strong>Họ tên:</strong>{" "}
              {selectedMember.full_name}
            </p>

            <p>
              <strong>Quan hệ:</strong>{" "}
              {selectedMember.relationship}
            </p>

            <p>
              <strong>Bệnh sử:</strong>{" "}
              {selectedMember.medical_history ||
                "Không có"}
            </p>
          </div>

          <div className="medication-section">
            <div className="section-header">
              <h2>THUỐC</h2>

              <button
                className="primary-button"
                onClick={() => {
                  setMedicationForm({
                    family_member_id:
                      selectedMember.id,
                    name: "",
                    dosage: "",
                    stock_quantity: 0,
                    min_threshold: 5,
                    expiry_date: "",
                  });

                  setShowMedicationForm(true);
                }}
              >
                + Thêm thuốc
              </button>
            </div>

            {medications.length === 0 ? (
              <p>Chưa có thuốc.</p>
            ) : (
              <div className="medication-list">
                {medications.map(
                  (medication) => (
                    <div
                      className="medication-card"
                      key={medication.id}
                    >
                      <h3>
                        {medication.name}
                      </h3>

                      <p>
                        {medication.dosage}
                      </p>

                      <p>
                        Tồn kho:{" "}
                        <strong>
                          {
                            medication.stock_quantity
                          }
                        </strong>
                      </p>

                      <p>
                        Hạn sử dụng:{" "}
                        {medication.expiry_date ||
                          "Không có"}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {showMedicationForm &&
              renderMedicationForm()}
          </div>

          <div className="schedule-section">
            <div className="section-header">
              <h2>LỊCH UỐNG</h2>

              <button
                className="primary-button"
                onClick={openScheduleForm}
              >
                + Tạo lịch
              </button>
            </div>

            {schedules.length === 0 ? (
              <p>
                Chưa có lịch uống thuốc.
              </p>
            ) : (
              <div className="schedule-list">
                {schedules.map(
                  (schedule) => (
                    <div
                      className="schedule-card"
                      key={schedule.id}
                    >
                      <h3>
                        {medications.find(
                          (medication) => medication.id === schedule.medication_id
                        )?.name || "Không tìm thấy thuốc"}
                      </h3>

                      <p>
                        Thời gian:{" "}
                        {Array.isArray(
                          schedule.reminder_times
                        )
                          ? schedule.reminder_times.join(
                            ", "
                          )
                          : ""}
                      </p>

                      <p>
                        Chu kỳ:{" "}
                        {schedule.frequency_days ===
                          1
                          ? "Mỗi ngày"
                          : `Mỗi ${schedule.frequency_days} ngày`}
                      </p>

                      <p>
                        Từ:{" "}
                        {
                          schedule.start_date
                        }
                      </p>

                      <p>
                        Đến:{" "}
                        {schedule.end_date ||
                          "Không giới hạn"}
                      </p>

                      <p>
                        Nhắc trước:{" "}
                        {
                          schedule.reminder_before_minutes
                        }{" "}
                        phút
                      </p>

                      <p>
                        Thông báo:{" "}
                        {
                          schedule.notification_message
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {showScheduleForm &&
              renderScheduleForm()}
          </div>
        </section>
      </>
    );
  };

  // =========================================================
  // MEDICATION FORM
  // =========================================================

  const renderMedicationForm = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>THÊM THUỐC</h2>

          <button
            type="button"
            className="modal-close"
            onClick={() => setShowMedicationForm(false)}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleAddMedication}>

            <div className="form-group">
              <label>Tên thuốc</label>
              <input
                type="text"
                name="name"
                value={medicationForm.name}
                onChange={handleMedicationInput}
                placeholder="Paracetamol"
              />
            </div>

            <div className="form-group">
              <label>Liều lượng</label>
              <input
                type="text"
                name="dosage"
                value={medicationForm.dosage}
                onChange={handleMedicationInput}
                placeholder="500mg"
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={medicationForm.description}
                onChange={handleMedicationInput}
                placeholder="Mô tả thuốc..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowMedicationForm(false)}
              >
                Hủy
              </button>

              <button type="submit" className="primary-button">
                Lưu thuốc
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );

  // =========================================================
  // SCHEDULE FORM
  // =========================================================

  const renderScheduleForm = () => (
    <div className="modal-overlay">
      <div className="modal modal-large">

        <div className="modal-header">
          <h2>THÊM LỊCH UỐNG THUỐC</h2>

          <button
            type="button"
            className="modal-close"
            onClick={() => setShowScheduleForm(false)}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleAddSchedule}>

            <div className="form-group">
              <label>Thành viên</label>

              <select
                name="family_member_id"
                value={scheduleForm.family_member_id}
                onChange={handleScheduleInput}
              >
                <option value="">-- Chọn thành viên --</option>

                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Thuốc</label>

              <select
                name="medication_id"
                value={scheduleForm.medication_id}
                onChange={handleScheduleInput}
              >
                <option value="">-- Chọn thuốc --</option>

                {medications.map((medication) => (
                  <option key={medication.id} value={medication.id}>
                    {medication.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tần suất</label>

              <input
                type="number"
                name="frequency_days"
                min="1"
                value={scheduleForm.frequency_days}
                onChange={handleScheduleInput}
              />
            </div>

            <div className="form-group">
              <label>Thời gian uống</label>

              {scheduleForm.reminder_times.map((time, index) => (
                <div className="time-input-row" key={index}>

                  <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [
                        ...scheduleForm.reminder_times
                      ];

                      newTimes[index] = e.target.value;

                      setScheduleForm({
                        ...scheduleForm,
                        reminder_times: newTimes
                      });
                    }}
                  />

                  {scheduleForm.reminder_times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newTimes =
                          scheduleForm.reminder_times.filter(
                            (_, i) => i !== index
                          );

                        setScheduleForm({
                          ...scheduleForm,
                          reminder_times: newTimes
                        });
                      }}
                    >
                      ×
                    </button>
                  )}

                </div>
              ))}

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setScheduleForm({
                    ...scheduleForm,
                    reminder_times: [
                      ...scheduleForm.reminder_times,
                      "08:00"
                    ]
                  })
                }
              >
                + Thêm giờ uống
              </button>
            </div>

            <div className="form-group">
              <label>Ngày bắt đầu</label>

              <input
                type="date"
                name="start_date"
                value={scheduleForm.start_date}
                onChange={handleScheduleInput}
              />
            </div>

            <div className="form-group">
              <label>Ngày kết thúc</label>

              <input
                type="date"
                name="end_date"
                value={scheduleForm.end_date}
                onChange={handleScheduleInput}
              />
            </div>
            <div className="form-group">
              <label>Nhắc trước (phút)</label>
              <input
                type="number"
                name="reminder_before_minutes"
                min="0"
                value={scheduleForm.reminder_before_minutes}
                onChange={handleScheduleInput}
              />
            </div>
            <div className="form-group">
              <label>Thông báo</label>

              <textarea
                name="notification_message"
                value={scheduleForm.notification_message}
                onChange={handleScheduleInput}
                placeholder="Đến giờ uống thuốc"
              />
            </div>

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowScheduleForm(false)}
              >
                Hủy
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Lưu lịch
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && members.length === 0) {
    return (
      <div className="dashboard-loading">
        Đang tải dữ liệu...
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

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

          {currentPage === "dashboard" &&
            renderOverview()}

          {currentPage === "member" &&
            renderMemberDetail()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;