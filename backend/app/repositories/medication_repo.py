from sqlalchemy.orm import Session
from app.models.medication import Medication
class MedicationRepository:
    @staticmethod
    def get_medications_by_member(
        db: Session,
        family_member_id: int
    ):
        return (
            db.query(Medication)
            .filter(
                Medication.family_member_id == family_member_id
            )
            .all()
        )
    @staticmethod
    def get_medication_by_id(
        db: Session,
        medication_id: int
    ):
        return (
            db.query(Medication)
            .filter(
                Medication.id == medication_id
            )
            .first()
        )

    @staticmethod
    def create_medication(
        db: Session,
        family_member_id: int,
        name: str,
        dosage: str = None,
        stock_quantity: int = 0,
        min_threshold: int = 5,
        expiry_date=None
    ):
        medication = Medication(
            family_member_id=family_member_id,
            name=name,
            dosage=dosage,
            stock_quantity=stock_quantity,
            min_threshold=min_threshold,
            expiry_date=expiry_date
        )

        db.add(medication)
        db.flush()

        return medication

    @staticmethod
    def delete_medication(
        db: Session,
        medication
    ):
        db.delete(medication)