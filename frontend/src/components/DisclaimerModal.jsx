import React from 'react';
import '../styles/DisclaimerModal.css'; // Trỏ ra ngoài thư mục styles

export default function DisclaimerModal({ isOpen, onAccept }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>⚠️ Giới hạn trách nhiệm y tế & Bảo mật</h3>
        <p>
          Hệ thống này là công cụ hỗ trợ quản lý lịch trình và nhắc nhở kỹ thuật số, 
          <strong> không có chức năng chẩn đoán bệnh, kê đơn thuốc</strong> hoặc thay thế các tư vấn y khoa từ bác sĩ.
        </p>
        <p>
          Bạn phải chịu trách nhiệm hoàn toàn trong việc nhập chính xác tên thuốc, liều lượng. 
          Nhà phát triển từ chối mọi trách nhiệm pháp lý đối với các vấn đề sức khỏe phát sinh do nhập sai thông tin.
        </p>
        <button className="btn-accept" onClick={onAccept}>
          Tôi đã hiểu và Đồng ý
        </button>
      </div>
    </div>
  );
}