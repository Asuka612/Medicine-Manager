from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from app.models.log import Log
from app.models.schedule import Schedule
from app.models.member import FamilyMember
from app.models.medication import Medication
from fastapi import HTTPException

class LogService:

    @staticmethod
    def ensure_logs_for_week(
        db: Session,
        schedule: Schedule,
        week_start: date,
        week_end: date
    ):
        """
        Tự tạo Log Pending cho các lần uống thuốc
        trong tuần nếu Log chưa tồn tại.
        """

        current_date = max(
            schedule.start_date,
            week_start
        )

        actual_end_date = week_end

        if schedule.end_date is not None:
            actual_end_date = min(
                schedule.end_date,
                week_end
            )

        if current_date > actual_end_date:
            return

        reminder_times = schedule.reminder_times or []

        while current_date <= actual_end_date:

            should_create = False

            # Nếu có weekdays thì ưu tiên weekdays
            if schedule.weekdays:
                # Python weekday:
                # Monday = 0 ... Sunday = 6
                if current_date.weekday() in schedule.weekdays:
                    should_create = True

            else:
                # Không có weekdays:
                # dùng frequency_days
                days_from_start = (
                    current_date - schedule.start_date
                ).days

                if (
                    days_from_start >= 0
                    and days_from_start % schedule.frequency_days == 0
                ):
                    should_create = True

            if should_create:

                for reminder_time in reminder_times:

                    try:
                        hour, minute = map(
                            int,
                            reminder_time.split(":")
                        )
                    except (ValueError, AttributeError):
                        continue

                    scheduled_time = datetime.combine(
                        current_date,
                        time(hour, minute)
                    )

                    existing_log = (
                        db.query(Log)
                        .filter(
                            Log.schedule_id == schedule.id,
                            Log.scheduled_time == scheduled_time
                        )
                        .first()
                    )

                    if not existing_log:
                        new_log = Log(
                            schedule_id=schedule.id,
                            status="Pending",
                            scheduled_time=scheduled_time,
                            action_time=None
                        )

                        db.add(new_log)

            current_date += timedelta(days=1)

        db.commit()
    @staticmethod
    def mark_missed_logs(
        db: Session,
        schedule: Schedule
    ):
        """
        Tự chuyển Log Pending thành Missed
        nếu đã quá thời gian uống 60 phút.
        """

        missed_before = datetime.now() - timedelta(
            minutes=60
        )

        db.query(Log).filter(
            Log.schedule_id == schedule.id,
            Log.status == "Pending",
            Log.scheduled_time < missed_before
        ).update(
            {
                "status": "Missed"
            },
            synchronize_session=False
        )

        db.commit()
    @staticmethod
    def get_member_log(
        db: Session,
        log_id: int,
        family_member_id: int
    ):
        log = (
            db.query(Log)
            .join(
                Schedule,
                Log.schedule_id == Schedule.id
            )
            .filter(
                Log.id == log_id,
                Schedule.family_member_id == family_member_id
            )
            .first()
        )

        if not log:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy nhật ký hoặc nhật ký không thuộc thành viên này."
            )

        return log
    @staticmethod
    def take_log(
        db: Session,
        log_id: int,
        family_member_id: int
    ):
        log = LogService.get_member_log(
            db,
            log_id,
            family_member_id
        )

        if log.status != "Pending":
            raise HTTPException(
                status_code=400,
                detail="Nhật ký này không còn ở trạng thái Pending."
            )

        now = datetime.now()

        if now < log.scheduled_time:
            raise HTTPException(
                status_code=400,
                detail="Chưa đến thời gian uống thuốc."
            )

        log.status = "Taken"
        log.action_time = now

        schedule = (
            db.query(Schedule)
            .filter(
                Schedule.id == log.schedule_id
            )
            .first()
        )

        if schedule:
            medication = (
                db.query(Medication)
                .filter(
                    Medication.id == schedule.medication_id
                )
                .first()
            )

            if medication and medication.stock_quantity > 0:
                medication.stock_quantity -= 1

        db.commit()
        db.refresh(log)

        return {
            "message": "Đã xác nhận uống thuốc.",
            "log_id": log.id,
            "status": log.status,
            "action_time": log.action_time
        }
    @staticmethod
    def skip_log(
        db: Session,
        log_id: int,
        family_member_id: int
    ):
        log = LogService.get_member_log(
            db,
            log_id,
            family_member_id
        )

        if log.status != "Pending":
            raise HTTPException(
                status_code=400,
                detail="Nhật ký này không còn ở trạng thái Pending."
            )

        now = datetime.now()

        if now < log.scheduled_time:
            raise HTTPException(
                status_code=400,
                detail="Chưa đến thời gian uống thuốc."
            )

        log.status = "Skipped"
        log.action_time = now

        db.commit()
        db.refresh(log)

        return {
            "message": "Đã bỏ qua liều thuốc.",
            "log_id": log.id,
            "status": log.status,
            "action_time": log.action_time
        }
    