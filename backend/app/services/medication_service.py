from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.models.member import FamilyMember
from app.models.medication import Medication
from app.repositories.medication_repo import MedicationRepository
from app.schemas.medication import MedicationCreate, MedicationUpdate
from app.models.schedule import Schedule
from app.models.log import Log


class MedicationService:

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
    def create_medication(
        db: Session,
        admin_id: int,
        data: MedicationCreate
    ):
        MedicationService.check_member_access(
            db,
            admin_id,
            data.family_member_id
        )

        if data.stock_quantity < 0:
            raise HTTPException(
                status_code=400,
                detail="Số lượng thuốc không được nhỏ hơn 0."
            )

        if data.min_threshold < 0:
            raise HTTPException(
                status_code=400,
                detail="Ngưỡng tồn kho không được nhỏ hơn 0."
            )

        try:
            medication = MedicationRepository.create_medication(
                db=db,
                family_member_id=data.family_member_id,
                name=data.name,
                dosage=data.dosage,
                stock_quantity=data.stock_quantity,
                min_threshold=data.min_threshold,
                expiry_date=data.expiry_date
            )

            db.commit()
            db.refresh(medication)

            return medication

        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_medications(
        db: Session,
        admin_id: int,
        family_member_id: int
    ):
        MedicationService.check_member_access(
            db,
            admin_id,
            family_member_id
        )

        return MedicationRepository.get_medications_by_member(
            db,
            family_member_id
        )

    @staticmethod
    def get_medication(
        db: Session,
        admin_id: int,
        medication_id: int
    ):
        medication = MedicationRepository.get_medication_by_id(
            db,
            medication_id
        )

        if not medication:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy thuốc."
            )

        MedicationService.check_member_access(
            db,
            admin_id,
            medication.family_member_id
        )

        return medication

    @staticmethod
    def update_medication(
        db: Session,
        admin_id: int,
        medication_id: int,
        data: MedicationUpdate
    ):
        medication = MedicationService.get_medication(
            db,
            admin_id,
            medication_id
        )

        if (
            data.stock_quantity is not None
            and data.stock_quantity < 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Số lượng thuốc không được nhỏ hơn 0."
            )

        if (
            data.min_threshold is not None
            and data.min_threshold < 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Ngưỡng tồn kho không được nhỏ hơn 0."
            )

        if data.name is not None:
            medication.name = data.name

        if data.dosage is not None:
            medication.dosage = data.dosage

        if data.stock_quantity is not None:
            medication.stock_quantity = data.stock_quantity

        if data.min_threshold is not None:
            medication.min_threshold = data.min_threshold

        if data.expiry_date is not None:
            medication.expiry_date = data.expiry_date

        db.commit()
        db.refresh(medication)

        return medication

    @staticmethod
    def delete_medication(
        db: Session,
        admin_id: int,
        medication_id: int
    ):
        medication = MedicationService.get_medication(
            db,
            admin_id,
            medication_id
        )

        try:
            # Lấy tất cả schedule sử dụng thuốc này
            schedules = (
                db.query(Schedule)
                .filter(
                    Schedule.medication_id == medication.id
                )
                .all()
            )

            schedule_ids = [schedule.id for schedule in schedules]

            # Xóa log của các schedule
            if schedule_ids:
                db.query(Log).filter(
                    Log.schedule_id.in_(schedule_ids)
                ).delete(
                    synchronize_session=False
                )

                # Xóa các schedule
                db.query(Schedule).filter(
                    Schedule.id.in_(schedule_ids)
                ).delete(
                    synchronize_session=False
                )

            # Xóa thuốc
            db.delete(medication)

            db.commit()

            return {
                "message": "Xóa thuốc thành công."
            }

        except Exception:
            db.rollback()
            raise