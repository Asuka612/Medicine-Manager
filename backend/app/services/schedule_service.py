from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from app.models.log import Log
from app.models.schedule import Schedule
from app.models.medication import Medication
from app.models.member import FamilyMember
from app.repositories.schedule_repo import ScheduleRepository
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate


class ScheduleService:

    @staticmethod
    def check_member_access(
        db: Session,
        admin_id: int,
        family_member_id: int
    ):
        member = (
            db.query(FamilyMember)
            .filter(
                FamilyMember.id == family_member_id,
                FamilyMember.admin_id == admin_id
            )
            .first()
        )

        if not member:
            raise HTTPException(
                status_code=403,
                detail="Bạn không có quyền quản lý thành viên này."
            )

        return member

    @staticmethod
    def create_schedule(
        db: Session,
        admin_id: int,
        data: ScheduleCreate
    ):
        ScheduleService.check_member_access(
            db,
            admin_id,
            data.family_member_id
        )

        medication = (
            db.query(Medication)
            .filter(
                Medication.id == data.medication_id,
                Medication.family_member_id == data.family_member_id
            )
            .first()
        )

        if not medication:
            raise HTTPException(
                status_code=404,
                detail="Thuốc không tồn tại hoặc không thuộc thành viên này."
            )

        if data.frequency_days <= 0:
            raise HTTPException(
                status_code=400,
                detail="Số ngày trong chu kỳ phải lớn hơn 0."
            )

        if data.reminder_before_minutes < 0:
            raise HTTPException(
                status_code=400,
                detail="Thời gian nhắc trước không được nhỏ hơn 0."
            )

        if data.end_date and data.end_date < data.start_date:
            raise HTTPException(
                status_code=400,
                detail="Ngày kết thúc không được trước ngày bắt đầu."
            )

        schedule = ScheduleRepository.create_schedule(
            db=db,
            family_member_id=data.family_member_id,
            medication_id=data.medication_id,
            frequency_days=data.frequency_days,
            reminder_times=data.reminder_times,
            start_date=data.start_date,
            end_date=data.end_date,
            notification_message=data.notification_message,
            reminder_before_minutes=data.reminder_before_minutes
        )

        return schedule

    @staticmethod
    def get_schedules(
        db: Session,
        admin_id: int,
        family_member_id: int
    ):
        ScheduleService.check_member_access(
            db,
            admin_id,
            family_member_id
        )

        return ScheduleRepository.get_schedules_by_member(
            db,
            family_member_id
        )

    @staticmethod
    def get_schedule(
        db: Session,
        admin_id: int,
        schedule_id: int
    ):
        schedule = ScheduleRepository.get_schedule_by_id(
            db,
            schedule_id
        )

        if not schedule:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy lịch uống thuốc."
            )

        ScheduleService.check_member_access(
            db,
            admin_id,
            schedule.family_member_id
        )

        return schedule

    @staticmethod
    def update_schedule(
        db: Session,
        admin_id: int,
        schedule_id: int,
        data: ScheduleUpdate
    ):
        schedule = ScheduleService.get_schedule(
            db,
            admin_id,
            schedule_id
        )

        if data.medication_id is not None:
            medication = (
                db.query(Medication)
                .filter(
                    Medication.id == data.medication_id,
                    Medication.family_member_id == schedule.family_member_id
                )
                .first()
            )

            if not medication:
                raise HTTPException(
                    status_code=404,
                    detail="Thuốc không tồn tại hoặc không thuộc thành viên này."
                )

            schedule.medication_id = data.medication_id

        if data.frequency_days is not None:
            if data.frequency_days <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Số ngày trong chu kỳ phải lớn hơn 0."
                )

            schedule.frequency_days = data.frequency_days

        if data.reminder_times is not None:
            schedule.reminder_times = data.reminder_times

        if data.start_date is not None:
            schedule.start_date = data.start_date

        if data.end_date is not None:
            if data.end_date < schedule.start_date:
                raise HTTPException(
                    status_code=400,
                    detail="Ngày kết thúc không được trước ngày bắt đầu."
                )

            schedule.end_date = data.end_date

        if data.notification_message is not None:
            schedule.notification_message = data.notification_message

        if data.reminder_before_minutes is not None:
            if data.reminder_before_minutes < 0:
                raise HTTPException(
                    status_code=400,
                    detail="Thời gian nhắc trước không được nhỏ hơn 0."
                )

            schedule.reminder_before_minutes = data.reminder_before_minutes

        db.commit()
        db.refresh(schedule)

        return schedule

    @staticmethod
    def delete_schedule(
        db: Session,
        admin_id: int,
        schedule_id: int
    ):
        schedule = ScheduleService.get_schedule(
            db,
            admin_id,
            schedule_id
        )

        try:
            db.delete(schedule)
            db.commit()

            return {
                "message": "Xóa lịch uống thuốc thành công."
            }

        except Exception:
            db.rollback()
            raise

    @staticmethod
    def confirm_taken_log(
        db: Session,
        log_id: int
    ):
        log = (
            db.query(Log)
            .filter(Log.id == log_id)
            .first()
        )

        if not log:
            return {
                "error": "Không tìm thấy nhật ký uống thuốc!"
            }

        if log.status == "Taken":
            return {
                "message": "Liều này đã được xác nhận trước đó rồi!"
            }

        log.status = "Taken"
        log.action_time = datetime.now()

        schedule = (
            db.query(Schedule)
            .filter(Schedule.id == log.schedule_id)
            .first()
        )

        is_low_stock = False
        current_stock = 0

        if schedule:
            medication = (
                db.query(Medication)
                .filter(Medication.id == schedule.medication_id)
                .first()
            )

            if medication:
                if medication.stock_quantity > 0:
                    medication.stock_quantity -= 1

                current_stock = medication.stock_quantity

                if medication.stock_quantity <= medication.min_threshold:
                    is_low_stock = True

        db.commit()
        db.refresh(log)

        return {
            "message": "Xác nhận uống thuốc thành công, đã cập nhật tồn kho!",
            "log_id": log.id,
            "current_stock": current_stock,
            "is_low_stock_warning": is_low_stock
        }