from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.services.log_service import LogService
from app.database import get_db
from app.models.member import FamilyMember
from app.models.schedule import Schedule
from app.models.medication import Medication
from app.models.log import Log
from app.models.user import User
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/member-dashboard",
    tags=["Member Dashboard"]
)


@router.get("/user/{user_id}")
def get_member_dashboard_by_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    week_start: date | None = None,
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bạn không có quyền xem dashboard của tài khoản này."
        )

    member = (
        db.query(FamilyMember)
        .filter(FamilyMember.member_id == current_user.id)
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy thành viên tương ứng với tài khoản."
        )

    return get_member_dashboard(
        family_member_id=member.id,
        week_start=week_start,
        db=db,
        current_user=current_user
    )


@router.get("/{family_member_id}")
def get_member_dashboard(
    family_member_id: int,
    current_user: User = Depends(get_current_user),
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

    if (
        current_user.role == "MEMBER"
        and member.member_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Bạn không có quyền xem dashboard của thành viên này."
        )

  

    if week_start is None:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())

    week_end = week_start + timedelta(days=6)

    

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

    
    log_result = []

    for log in logs:

        log_result.append({
            "id": log.id,
            "schedule_id": log.schedule_id,
            "status": log.status,
            "scheduled_time": log.scheduled_time,
            "action_time": log.action_time
        })


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