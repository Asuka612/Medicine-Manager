from sqlalchemy.orm import Session
from app.models.schedule import Schedule
from app.models.log import Log

class ScheduleRepository:
    @staticmethod
    def get_schedule_by_id(db: Session, schedule_id: int):
        return db.query(Schedule).filter(Schedule.id == schedule_id).first()

    @staticmethod
    def get_logs_by_member(db: Session, member_id: int):
        # Lấy tất cả log thông qua schedule của member
        schedules = db.query(Schedule).filter(Schedule.member_id == member_id).all()
        schedule_ids = [s.id for s in schedules]
        return db.query(Log).filter(Log.schedule_id.in_(schedule_ids)).all()