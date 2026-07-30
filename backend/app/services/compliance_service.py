from sqlalchemy.orm import Session
from app.models.log import Log
from app.models.schedule import Schedule

def calculate_member_compliance(db: Session, member_id: int):
    # Lấy tất cả lịch trình thuộc về thành viên này
    schedules = db.query(Schedule).filter(Schedule.member_id == member_id).all()
    schedule_ids = [s.id for s in schedules]

    if not schedule_ids:
        return {"member_id": member_id, "compliance_rate": 100.0, "message": "Chưa có lịch trình nào."}

    # Tổng số bản ghi log của thành viên
    total_logs = db.query(Log).filter(Log.schedule_id.in_(schedule_ids)).count()
    if total_logs == 0:
        return {"member_id": member_id, "compliance_rate": 100.0, "message": "Chưa có nhật ký ghi nhận."}

    # Tổng số liều đã uống (Taken)
    taken_logs = db.query(Log).filter(
        Log.schedule_id.in_(schedule_ids),
        Log.status == "Taken"
    ).count()

    # Tính phần trăm tuân thủ
    compliance_rate = (taken_logs / total_logs) * 100.0

    return {
        "member_id": member_id,
        "total_logs": total_logs,
        "taken_logs": taken_logs,
        "compliance_rate": round(compliance_rate, 2)
    }