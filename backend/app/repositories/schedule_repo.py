from sqlalchemy.orm import Session
from app.models.schedule import Schedule
from app.models.log import Log


class ScheduleRepository:

    @staticmethod
    def get_schedule_by_id(db: Session, schedule_id: int):
        return (
            db.query(Schedule)
            .filter(Schedule.id == schedule_id)
            .first()
        )

    @staticmethod
    def get_schedules_by_member(
        db: Session,
        family_member_id: int
    ):
        return (
            db.query(Schedule)
            .filter(
                Schedule.family_member_id == family_member_id
            )
            .all()
        )

    @staticmethod
    def create_schedule(
        db: Session,
        family_member_id: int,
        medication_id: int,
        frequency_days: int,
        reminder_times: list,
        start_date,
        end_date,
        weekdays: list,
        reminder_before_minutes: int,
        notification_message: str
    ):
        schedule = Schedule(
            family_member_id=family_member_id,
            medication_id=medication_id,
            frequency_days=frequency_days,
            reminder_times=reminder_times,
            weekdays=weekdays,
            start_date=start_date,
            end_date=end_date,
            reminder_before_minutes=reminder_before_minutes,
            notification_message=notification_message
        )

        db.add(schedule)
        db.flush()

        return schedule

    @staticmethod
    def update_schedule(
        db: Session,
        schedule: Schedule,
        medication_id=None,
        frequency_days=None,
        reminder_times=None,
        start_date=None,
        weekdays=None,
        end_date=None,
        reminder_before_minutes=None,
        notification_message=None
    ):
        if medication_id is not None:
            schedule.medication_id = medication_id
        if weekdays is not None:
            schedule.weekdays = weekdays
        if frequency_days is not None:
            schedule.frequency_days = frequency_days

        if reminder_times is not None:
            schedule.reminder_times = reminder_times

        if start_date is not None:
            schedule.start_date = start_date

        if end_date is not None:
            schedule.end_date = end_date

        if reminder_before_minutes is not None:
            schedule.reminder_before_minutes = reminder_before_minutes

        if notification_message is not None:
            schedule.notification_message = notification_message

        db.flush()

        return schedule

    @staticmethod
    def delete_schedule(
        db: Session,
        schedule: Schedule
    ):
        db.delete(schedule)
        db.flush()

    @staticmethod
    def get_logs_by_member(
        db: Session,
        member_id: int
    ):
        schedules = (
            db.query(Schedule)
            .filter(
                Schedule.family_member_id == member_id
            )
            .all()
        )

        schedule_ids = [s.id for s in schedules]

        if not schedule_ids:
            return []

        return (
            db.query(Log)
            .filter(Log.schedule_id.in_(schedule_ids))
            .all()
        )