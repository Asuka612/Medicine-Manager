from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate
from app.services.schedule_service import ScheduleService
from app.services.compliance_service import calculate_member_compliance
from app.services.log_service import LogService
router = APIRouter(
    prefix="/api/schedules",
    tags=["Schedules & Compliance"]
)


@router.post("/")
def create_schedule(
    data: ScheduleCreate,
    admin_id: int,
    db: Session = Depends(get_db)
):
    schedule = ScheduleService.create_schedule(
        db=db,
        admin_id=admin_id,
        data=data
    )

    return {
        "message": "Tạo lịch uống thuốc thành công.",
        "schedule": schedule
    }


@router.get("/member/{family_member_id}")
def get_schedules_by_member(
    family_member_id: int,
    admin_id: int,
    db: Session = Depends(get_db)
):
    return ScheduleService.get_schedules(
        db=db,
        admin_id=admin_id,
        family_member_id=family_member_id
    )


@router.get("/{schedule_id}")
def get_schedule(
    schedule_id: int,
    admin_id: int,
    db: Session = Depends(get_db)
):
    return ScheduleService.get_schedule(
        db=db,
        admin_id=admin_id,
        schedule_id=schedule_id
    )


@router.put("/{schedule_id}")
def update_schedule(
    schedule_id: int,
    data: ScheduleUpdate,
    admin_id: int,
    db: Session = Depends(get_db)
):
    schedule = ScheduleService.update_schedule(
        db=db,
        admin_id=admin_id,
        schedule_id=schedule_id,
        data=data
    )

    return {
        "message": "Cập nhật lịch uống thuốc thành công.",
        "schedule": schedule
    }


@router.delete("/{schedule_id}")
def delete_schedule(
    schedule_id: int,
    admin_id: int,
    db: Session = Depends(get_db)
):
    return ScheduleService.delete_schedule(
        db=db,
        admin_id=admin_id,
        schedule_id=schedule_id
    )


@router.post("/logs/{log_id}/take")
def api_take_log(
    log_id: int,
    family_member_id: int,
    db: Session = Depends(get_db)
):
    return LogService.take_log(
        db,
        log_id,
        family_member_id
    )
@router.post("/logs/{log_id}/skip")
def api_skip_log(
    log_id: int,
    family_member_id: int,
    db: Session = Depends(get_db)
):
    return LogService.skip_log(
        db,
        log_id,
        family_member_id
    )

@router.get("/compliance/{member_id}")
def api_get_compliance(
    member_id: int,
    db: Session = Depends(get_db)
):
    return calculate_member_compliance(
        db,
        member_id
    )