import asyncio
from datetime import datetime, date, timedelta

from app.database import SessionLocal
from app.models.log import Log
from app.models.schedule import Schedule
from app.models.medication import Medication
from app.models.member import FamilyMember
from app.models.user import User
from app.services.notification_service import NotificationService
from app.services.log_service import LogService


NOTIFIED_LOGS = set()


class SchedulerService:

    @staticmethod
    def check_notifications():
        db = SessionLocal()

        try:
            today = date.today()

            schedules = (
                db.query(Schedule)
                .filter(
                    Schedule.start_date <= today
                )
                .all()
            )

            for schedule in schedules:

                if (
                    schedule.end_date is not None
                    and schedule.end_date < today
                ):
                    continue

                week_start = today
                week_end = today

                LogService.ensure_logs_for_week(
                    db=db,
                    schedule=schedule,
                    week_start=week_start,
                    week_end=week_end
                )

                now = datetime.now()

                logs = (
                    db.query(Log)
                    .filter(
                        Log.schedule_id == schedule.id,
                        Log.status == "Pending"
                    )
                    .all()
                )

                for log in logs:

                    if log.id in NOTIFIED_LOGS:
                        continue

                    reminder_before = (
                        schedule.reminder_before_minutes or 0
                    )

                    notification_time = (
                        log.scheduled_time
                        - timedelta(
                            minutes=reminder_before
                        )
                    )
                    if reminder_before > 0:

                        if not (
                            notification_time <= now
                            < log.scheduled_time
                        ):
                            continue

                    else:

                        if now < log.scheduled_time:
                            continue

                    medication = (
                        db.query(Medication)
                        .filter(
                            Medication.id
                            == schedule.medication_id
                        )
                        .first()
                    )
                    member = (
                        db.query(FamilyMember)
                        .filter(
                            FamilyMember.id
                            == schedule.family_member_id
                        )
                        .first()
                    )

                    if not medication or not member:
                        continue

                    user = (
                        db.query(User)
                        .filter(
                            User.id == member.member_id
                        )
                        .first()
                    )

                    if not user:
                        continue

                    print(
                        "[Scheduler] SEND | "
                        f"schedule_id={schedule.id} | "
                        f"log_id={log.id} | "
                        f"family_member_id="
                        f"{schedule.family_member_id} | "
                        f"user_id={user.id} | "
                        f"email={user.email} | "
                        f"scheduled_time="
                        f"{log.scheduled_time} | "
                        f"notification_time="
                        f"{notification_time} | "
                        f"now={now}"
                    )

                

                    NotificationService.send_notification(
                        receiver_email=user.email,
                        subject="Đến giờ uống thuốc",
                        message=(
                            f"Đã đến giờ uống thuốc.\n\n"
                            f"Thuốc: {medication.name}\n"
                            f"Liều lượng: "
                            f"{medication.dosage or 'Chưa cập nhật'}\n"
                            f"Thời gian: "
                            f"{log.scheduled_time.strftime('%H:%M %d/%m/%Y')}\n\n"
                            f"Vui lòng mở hệ thống để xác nhận."
                        )
                    )

                   
                    NOTIFIED_LOGS.add(log.id)

        finally:
            db.close()

    @staticmethod
    async def run():

        while True:

            try:
                SchedulerService.check_notifications()

            except Exception as error:
                print(
                    f"[Scheduler] Lỗi: {error}"
                )

            
            await asyncio.sleep(10)