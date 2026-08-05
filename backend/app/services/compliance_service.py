from sqlalchemy.orm import Session
from app.models.log import Log
from app.models.schedule import Schedule

def calculate_member_compliance(db: Session, family_member_id: int):
    schedules = db.query(Schedule).filter(
        Schedule.family_member_id == family_member_id
    ).all()

    schedule_ids = [s.id for s in schedules]

    if not schedule_ids:
        return {
            "family_member_id": family_member_id,
            "compliance_rate": 100.0,
            "message": "Chưa có lịch trình nào."
        }

    total_logs = db.query(Log).filter(
        Log.schedule_id.in_(schedule_ids)
    ).count()

    if total_logs == 0:
        return {
            "family_member_id": family_member_id,
            "compliance_rate": 100.0,
            "message": "Chưa có nhật ký ghi nhận."
        }

    taken_logs = db.query(Log).filter(
        Log.schedule_id.in_(schedule_ids),
        Log.status == "Taken"
    ).count()

    compliance_rate = (taken_logs / total_logs) * 100

    return {
        "family_member_id": family_member_id,
        "total_logs": total_logs,
        "taken_logs": taken_logs,
        "compliance_rate": round(compliance_rate, 2)
    }