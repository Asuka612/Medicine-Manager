import { useEffect, useState } from "react";
import "../styles/Member.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Member({ member, onBack }) {
  const adminId = localStorage.getItem("admin_id");

  const [selectedMember, setSelectedMember] = useState(member);

  const [medications, setMedications] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const [compliance, setCompliance] = useState(0);

  const [medicationForm, setMedicationForm] = useState({
    family_member_id: member.id,
    name: "",
    dosage: "",
    stock_quantity: 0,
    min_threshold: 5,
    expiry_date: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    family_member_id: member.id,
    medication_id: "",
    frequency_days: 1,
    reminder_times: ["08:00"],
    start_date: "",
    end_date: "",
    reminder_before_minutes: 10,
    notification_message: "Đến giờ uống thuốc",
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

    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError("");

      const memberId = member.id;

      const [
        memberResponse,
        medicationResponse,
        scheduleResponse,
        complianceResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/members/${memberId}?admin_id=${adminId}`
        ),
        fetch(
          `${API_BASE_URL}/api/medications/member/${memberId}?admin_id=${adminId}`
        ),
        fetch(
          `${API_BASE_URL}/api/schedules/member/${memberId}?admin_id=${adminId}`
        ),
        fetch(
          `${API_BASE_URL}/api/schedules/compliance/${memberId}`
        ),
      ]);

      if (!memberResponse.ok) {
        throw new Error("Không thể lấy thông tin thành viên.");
      }

      if (!medicationResponse.ok) {
        throw new Error("Không thể lấy danh sách thuốc.");
      }

      if (!scheduleResponse.ok) {
        throw new Error("Không thể lấy danh sách lịch uống.");
      }

      const memberData = await memberResponse.json();
      const medicationData = await medicationResponse.json();
      const scheduleData = await scheduleResponse.json();

      setSelectedMember(memberData);
      setMedications(medicationData);
      setSchedules(scheduleData);

      if (complianceResponse.ok) {
        const complianceData = await complianceResponse.json();

        if (typeof complianceData === "number") {
          setCompliance(complianceData);
        } else if (
          complianceData.compliance_rate !== undefined
        ) {
          setCompliance(complianceData.compliance_rate);
        } else if (
          complianceData.compliance !== undefined
        ) {
          setCompliance(complianceData.compliance);
        } else if (
          complianceData.rate !== undefined
        ) {
          setCompliance(complianceData.rate);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa thành viên này không? Toàn bộ thuốc, lịch uống và nhật ký liên quan cũng sẽ bị xóa."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/members/${member.id}?admin_id=${adminId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Xóa thành viên thất bại."
        );
      }

      alert(
        data.message || "Xóa thành viên thành công."
      );

      onBack();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleMedicationInput = (e) => {
    const { name, value } = e.target;

    setMedicationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();

    if (!medicationForm.name.trim()) {
      alert("Vui lòng nhập tên thuốc.");
      return;
    }

    try {
      const payload = {
        family_member_id: member.id,
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
        family_member_id: member.id,
        name: "",
        dosage: "",
        stock_quantity: 0,
        min_threshold: 5,
        expiry_date: "",
      });

      setShowMedicationForm(false);

      await loadMemberData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDeleteMedication = async (
    medicationId
  ) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa thuốc này không? Các lịch uống và nhật ký liên quan cũng sẽ bị xóa."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medications/${medicationId}?admin_id=${adminId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Xóa thuốc thất bại."
        );
      }

      alert(
        data.message || "Xóa thuốc thành công."
      );

      await loadMemberData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleScheduleInput = (e) => {
    const { name, value } = e.target;

    setScheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScheduleMedicationChange = (e) => {
    setScheduleForm((prev) => ({
      ...prev,
      medication_id: Number(e.target.value),
    }));
  };

  const handleReminderTimeChange = (
    index,
    value
  ) => {
    setScheduleForm((prev) => {
      const times = [
        ...prev.reminder_times,
      ];

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
    if (
      scheduleForm.reminder_times.length === 1
    ) {
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

  const openScheduleForm = () => {
    setScheduleForm({
      family_member_id: member.id,
      medication_id:
        medications[0]?.id || "",
      frequency_days: 1,
      reminder_times: ["08:00"],
      start_date: "",
      end_date: "",
      reminder_before_minutes: 10,
      notification_message:
        "Đến giờ uống thuốc",
    });

    setShowScheduleForm(true);
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();

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
        family_member_id: member.id,
        medication_id: Number(
          scheduleForm.medication_id
        ),
        frequency_days: Number(
          scheduleForm.frequency_days
        ),
        weekdays: [],
        reminder_times:
          scheduleForm.reminder_times,
        start_date: scheduleForm.start_date,
        end_date:
          scheduleForm.end_date || null,
        reminder_before_minutes: Number(
          scheduleForm.reminder_before_minutes
        ),
        notification_message:
          scheduleForm.notification_message,
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
        family_member_id: member.id,
        medication_id: "",
        frequency_days: 1,
        reminder_times: ["08:00"],
        start_date: "",
        end_date: "",
        reminder_before_minutes: 10,
        notification_message:
          "Đến giờ uống thuốc",
      });

      setShowScheduleForm(false);

      await loadMemberData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDeleteSchedule = async (
    scheduleId
  ) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa lịch uống thuốc này không? Nhật ký uống thuốc của lịch này cũng sẽ bị xóa."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/schedules/${scheduleId}?admin_id=${adminId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Xóa lịch uống thất bại."
        );
      }

      alert(
        data.message || "Xóa lịch uống thành công."
      );

      await loadMemberData();
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
          type="button"
          className="sidebar-item"
          onClick={onBack}
        >
          Dashboard
        </button>

        <button
          type="button"
          className="sidebar-item active"
        >
          Thành viên
        </button>

        <button
          type="button"
          className="sidebar-item"
        >
          Nhật ký
        </button>

        <button
          type="button"
          className="sidebar-item"
        >
          Thống kê
        </button>

        <button
          type="button"
          className="sidebar-item"
        >
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

  const renderMedicationForm = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>THÊM THUỐC</h2>

          <button
            type="button"
            className="modal-close"
            onClick={() =>
              setShowMedicationForm(false)
            }
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
              <label>Số lượng tồn kho</label>

              <input
                type="number"
                name="stock_quantity"
                min="0"
                value={
                  medicationForm.stock_quantity
                }
                onChange={handleMedicationInput}
              />
            </div>

            <div className="form-group">
              <label>Ngưỡng cảnh báo</label>

              <input
                type="number"
                name="min_threshold"
                min="0"
                value={
                  medicationForm.min_threshold
                }
                onChange={handleMedicationInput}
              />
            </div>

            <div className="form-group">
              <label>Ngày hết hạn</label>

              <input
                type="date"
                name="expiry_date"
                value={
                  medicationForm.expiry_date
                }
                onChange={handleMedicationInput}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowMedicationForm(false)
                }
              >
                Hủy
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Lưu thuốc
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderScheduleForm = () => (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>THÊM LỊCH UỐNG THUỐC</h2>

          <button
            type="button"
            className="modal-close"
            onClick={() =>
              setShowScheduleForm(false)
            }
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleAddSchedule}>
            <div className="form-group">
              <label>Thuốc</label>

              <select
                name="medication_id"
                value={
                  scheduleForm.medication_id
                }
                onChange={
                  handleScheduleMedicationChange
                }
              >
                <option value="">
                  -- Chọn thuốc --
                </option>

                {medications.map(
                  (medication) => (
                    <option
                      key={medication.id}
                      value={medication.id}
                    >
                      {medication.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Tần suất (mỗi bao nhiêu ngày)</label>

              <input
                type="number"
                name="frequency_days"
                min="1"
                value={
                  scheduleForm.frequency_days
                }
                onChange={handleScheduleInput}
              />
            </div>

            <div className="form-group">
              <label>Thời gian uống</label>

              {scheduleForm.reminder_times.map(
                (time, index) => (
                  <div
                    className="time-input-row"
                    key={index}
                  >
                    <input
                      type="time"
                      value={time}
                      onChange={(e) =>
                        handleReminderTimeChange(
                          index,
                          e.target.value
                        )
                      }
                    />

                    {scheduleForm
                      .reminder_times.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeReminderTime(
                            index
                          )
                        }
                      >
                        ×
                      </button>
                    )}
                  </div>
                )
              )}

              <button
                type="button"
                className="secondary-button"
                onClick={addReminderTime}
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
                value={
                  scheduleForm.reminder_before_minutes
                }
                onChange={handleScheduleInput}
              />
            </div>

            <div className="form-group">
              <label>Thông báo</label>

              <textarea
                name="notification_message"
                value={
                  scheduleForm.notification_message
                }
                onChange={handleScheduleInput}
                placeholder="Đến giờ uống thuốc"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowScheduleForm(false)
                }
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

  const renderMemberDetail = () => (
    <>
     <div className="member-page">
      <div className="member-detail-header">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Thành viên:{" "}
          {selectedMember?.full_name || member.full_name}
        </button>
      </div>

      <section className="member-detail">
        <div className="member-profile">
          <h2>THÔNG TIN</h2>

          <p>
            <strong>Họ tên:</strong>{" "}
            {selectedMember?.full_name}
          </p>

          <p>
            <strong>Quan hệ:</strong>{" "}
            {selectedMember?.relationship || "Không có"}
          </p>

          <p>
            <strong>Bệnh sử:</strong>{" "}
            {selectedMember
              ?.medical_history_encrypted ||
              "Không có"}
          </p>

          <p>
            <strong>Tuân thủ:</strong>{" "}
            {compliance}%
          </p>

          <button
            type="button"
            className="delete-button"
            onClick={handleDeleteMember}
          >
            Xóa thành viên
          </button>
        </div>

        <div className="medication-section">
          <div className="section-header">
            <h2>THUỐC</h2>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setMedicationForm({
                  family_member_id: member.id,
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
                      Liều lượng:{" "}
                      {medication.dosage || "Không có"}
                    </p>

                    <p>
                      Tồn kho:{" "}
                      <strong>
                        {medication.stock_quantity}
                      </strong>
                    </p>

                    <p>
                      Hạn sử dụng:{" "}
                      {medication.expiry_date ||
                        "Không có"}
                    </p>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDeleteMedication(
                          medication.id
                        )
                      }
                    >
                      Xóa thuốc
                    </button>
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
              type="button"
              className="primary-button"
              onClick={openScheduleForm}
            >
              + Tạo lịch
            </button>
          </div>

          {schedules.length === 0 ? (
            <p>Chưa có lịch uống thuốc.</p>
          ) : (
            <div className="schedule-list">
              {schedules.map(
                (schedule) => {
                  const medication =
                    medications.find(
                      (item) =>
                        Number(item.id) ===
                        Number(
                          schedule.medication_id
                        )
                    );

                  return (
                    <div
                      className="schedule-card"
                      key={schedule.id}
                    >
                      <h3>
                        {medication?.name ||
                          "Không tìm thấy thuốc"}
                      </h3>

                      <p>
                        Liều lượng:{" "}
                        {medication?.dosage ||
                          "Không có"}
                      </p>

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
                        {schedule.start_date}
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

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDeleteSchedule(
                            schedule.id
                          )
                        }
                      >
                        Xóa lịch
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {showScheduleForm &&
            renderScheduleForm()}
        </div>
      </section>
      </div>
    </>
  );

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

          {renderMemberDetail()}
        </div>
      </main>
    </div>
  );
}

export default Member;