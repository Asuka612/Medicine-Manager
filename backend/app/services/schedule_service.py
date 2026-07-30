from sqlalchemy.orm import Session
from app.models.log import Log
from app.models.schedule import Schedule
from app.models.medication import Medication
from datetime import datetime

def confirm_taken_log(db: Session, log_id: int):
    log = db.query(Log).filter(Log.id == log_id).first()
    if not log:
        return {"error": "Không tìm thấy nhật ký uống thuốc!"}
    
    if log.status == "Taken":
        return {"message": "Liều này đã được xác nhận trước đó rồi!"}

    # 1. Cập nhật trạng thái log
    log.status = "Taken"
    log.action_time = datetime.now()

    # 2. Lấy thông tin schedule -> medication để trừ tồn kho tự động
    schedule = db.query(Schedule).filter(Schedule.id == log.schedule_id).first()
    is_low_stock = False
    current_stock = 0

    if schedule:
        medication = db.query(Medication).filter(Medication.id == schedule.medication_id).first()
        if medication:
            if medication.stock_quantity > 0:
                medication.stock_quantity -= 1
            current_stock = medication.stock_quantity
            
            # 3. Kiểm tra ngưỡng tồn kho thấp
            if medication.stock_quantity <= medication.min_threshold:
                is_low_stock = True

    db.commit()
    db.refresh(log)

    return {
        "message": "Xác nhận uống thuốc thành công, đã cập nhật tồn kho!",
        "log_id": log.id,
        "current_stock": current_stock,
        "is_low_stock_warning": is_low_stock
    }