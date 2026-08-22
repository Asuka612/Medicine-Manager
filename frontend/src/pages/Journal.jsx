import { useEffect, useState } from "react";
import "../styles/Journal.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Journal({ onBack }) {
    const adminId = localStorage.getItem("admin_id");
    const [logs, setLogs] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadMembers = async () => {
        try {
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
        }
    };

    const loadJournal = async () => {
        try {
            setLoading(true);
            setError("");

            let url = `${API_BASE_URL}/api/journal/?admin_id=${adminId}`;

            if (selectedMember) {
                url += `&family_member_id=${selectedMember}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Không thể lấy nhật ký.");
            }

            const data = await response.json();
            setLogs(data);
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

        loadMembers();
    }, []);

    useEffect(() => {
        if (adminId) {
            loadJournal();
        }
    }, [selectedMember]);

    const filteredLogs = logs.filter((log) => {
        if (!selectedStatus) {
            return true;
        }

        if (selectedStatus === "Pending") {
            return (
                log.status === "Pending" ||
                log.status === "Missed"
            );
        }

        return log.status === selectedStatus;
    });

    const formatDateTime = (value) => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        return date.toLocaleString("vi-VN");
    };

    const getStatusText = (status) => {
    if (status === "Taken") {
        return "Đã uống";
    }

    if (status === "Pending") {
        return "Chưa uống";
    }

    if (status === "Missed") {
        return "Quá giờ";
    }

    if (status === "Skipped") {
        return "Bỏ qua";
    }

    return status || "Không xác định";
};

    if (loading) {
        return (
            <div className="dashboard-loading">
                Đang tải nhật ký...
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
                        Quay Lại
                    </button>

                    
                </nav>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-title">
                        NHẬT KÝ UỐNG THUỐC
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

                    <div className="journal-title-section">
                        <h1>NHẬT KÝ</h1>
                    </div>

                    <div className="journal-filters">
                        <div className="form-group">
                            <label>Thành viên</label>

                            <select
                                value={selectedMember}
                                onChange={(e) =>
                                    setSelectedMember(e.target.value)
                                }
                            >
                                <option value="">
                                    Tất cả thành viên
                                </option>

                                {members.map((member) => (
                                    <option
                                        key={member.id}
                                        value={member.id}
                                    >
                                        {member.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Trạng thái</label>

                            <select
                                value={selectedStatus}
                                onChange={(e) =>
                                    setSelectedStatus(e.target.value)
                                }
                            >
                                <option value="">
                                    Tất cả
                                </option>

                                <option value="Taken">
                                    Đã uống
                                </option>

                                <option value="Pending">
                                    Chưa uống
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="journal-section">
                        <div className="journal-table-wrapper">
                            <table className="journal-table">
                                <thead>
                                    <tr>
                                        <th>Thành viên</th>
                                        <th>Thuốc</th>
                                        <th>Liều lượng</th>
                                        <th>Giờ dự kiến</th>
                                        <th>Thời điểm uống</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6">
                                                Không có nhật ký.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <tr key={log.log_id}>
                                                <td>{log.member_name}</td>

                                                <td>{log.medication_name}</td>

                                                <td>
                                                    {log.dosage || "—"}
                                                </td>

                                                <td>
                                                    {formatDateTime(
                                                        log.scheduled_time
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDateTime(
                                                        log.action_time
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            log.status === "Taken"
                                                                ? "journal-status taken"
                                                                : "journal-status pending"
                                                        }
                                                    >
                                                        {getStatusText(
                                                            log.status
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Journal;