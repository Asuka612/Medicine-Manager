import asyncio
from datetime import datetime, date

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

                # Đảm bảo có Log
                week_start = (
                    today
                )

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
                        Log.status == "Pending",
                        Log.scheduled_time <= now
                    )
                    .all()
                )

                for log in logs:

                    if log.id in NOTIFIED_LOGS:
                        continue

                    medication = (
                        db.query(Medication)
                        .filter(
                            Medication.id == schedule.medication_id
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