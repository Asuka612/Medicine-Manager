from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.log_service import LogService
from app.database import get_db
from app.models.member import FamilyMember
from app.models.schedule import Schedule
from app.models.medication import Medication
from app.models.log import Log


router = APIRouter(
    prefix="/api/member-dashboard",
    tags=["Member Dashboard"]
)


@router.get("/{family_member_id}")
def get_member_dashboard(
    family_member_id: int,
    week_start: date | None = None,
    db: Session = Depends(get_db)
):
    member = (
        db.query(FamilyMember)
        .filter(FamilyMember.id == family_member_id)
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy thành viên."
        )

    # ==========================================
    # 2. Xác định tuần
    # ==========================================

    if week_start is None:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())

    week_end = week_start + timedelta(days=6)

    # ==========================================
    # 3. Lấy schedules
    # ==========================================

    schedules = (
        db.query(Schedule)
        .filter(
            Schedule.family_member_id == family_member_id
        )
        .all()
    )
    for schedule in schedules:
        LogService.ensure_logs_for_week(
            db=db,
            schedule=schedule,
            week_start=week_start,
            week_end=week_end
        )

        LogService.mark_missed_logs(
            db=db,
            schedule=schedule
        )
    # 4. Lấy medications
    medication_ids = [
        schedule.medication_id
        for schedule in schedules
    ]

    medications = {}

    if medication_ids:
        medication_list = (
            db.query(Medication)
            .filter(
                Medication.id.in_(medication_ids)
            )
            .all()
        )

        medications = {
            medication.id: medication
            for medication in medication_list
        }

    # ==========================================
    # 5. Lấy logs có sẵn trong tuần
    # ==========================================

    logs = (
        db.query(Log)
        .join(
            Schedule,
            Log.schedule_id == Schedule.id
        )
        .filter(
            Schedule.family_member_id == family_member_id,
            Log.scheduled_time >= week_start,
            Log.scheduled_time < week_end + timedelta(days=1)
        )
        .all()
    )

    # ==========================================
    # 6. Format schedules
    # ==========================================

    schedule_result = []

    for schedule in schedules:

        medication = medications.get(
            schedule.medication_id
        )

        schedule_result.append({
            "id": schedule.id,

            "medication_id": schedule.medication_id,

            "medication_name": (
                medication.name
                if medication
                else "Không xác định"
            ),

            "dosage": (
                medication.dosage
                if medication
                else ""
            ),

            "frequency_days": schedule.frequency_days,

            "reminder_times": (
                schedule.reminder_times
                if schedule.reminder_times
                else []
            ),

            "start_date": schedule.start_date,

            "end_date": schedule.end_date,

            "notification_message": (
                schedule.notification_message
            )
        })

    # ==========================================
    # 7. Format logs
    # ==========================================

    log_result = []

    for log in logs:

        log_result.append({
            "id": log.id,
            "schedule_id": log.schedule_id,
            "status": log.status,
            "scheduled_time": log.scheduled_time,
            "action_time": log.action_time
        })

    # ==========================================
    # 8. Response
    # ==========================================

    return {
        "member": {
            "id": member.id,
            "member_id": member.member_id,
            "full_name": member.full_name,
            "relationship": member.relationship
        },

        "week": {
            "start": week_start,
            "end": week_end
        },

        "schedules": schedule_result,

        "logs": log_result
    }