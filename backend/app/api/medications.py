from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.medication import MedicationCreate, MedicationUpdate
from app.services.medication_service import MedicationService

router = APIRouter(
    prefix="/api/medications",
    tags=["Medications"]
)


@router.post("/")
def create_medication(
    data: MedicationCreate,
    admin_id: int,
    db: Session = Depends(get_db)
):
    medication = MedicationService.create_medication(
        db=db,
        admin_id=admin_id,
        data=data
    )

    return {
        "message": "Tạo thuốc thành công.",
        "medication": {
            "id": medication.id,
            "family_member_id": medication.family_member_id,
            "name": medication.name,
            "dosage": medication.dosage,
            "stock_quantity": medication.stock_quantity,
            "min_threshold": medication.min_threshold,
            "expiry_date": medication.expiry_date
        }
    }


@router.get("/member/{family_member_id}")
def get_medications(
    family_member_id: int,
    admin_id: int,
    db: Session = Depends(get_db)
):
    medications = MedicationService.get_medications(
        db=db,
        admin_id=admin_id,
        family_member_id=family_member_id
    )

    return medications


@router.get("/{medication_id}")
def get_medication(
    medication_id: int,
    admin_id: int,
    db: Session = Depends(get_db)
):
    medication = MedicationService.get_medication(
        db=db,
        admin_id=admin_id,
        medication_id=medication_id
    )

    return medication


@router.put("/{medication_id}")
def update_medication(
    medication_id: int,
    data: MedicationUpdate,
    admin_id: int,
    db: Session = Depends(get_db)
):
    medication = MedicationService.update_medication(
        db=db,
        admin_id=admin_id,
        medication_id=medication_id,
        data=data
    )

    return {
        "message": "Cập nhật thuốc thành công.",
        "medication": {
            "id": medication.id,
            "family_member_id": medication.family_member_id,
            "name": medication.name,
            "dosage": medication.dosage,
            "stock_quantity": medication.stock_quantity,
            "min_threshold": medication.min_threshold,
            "expiry_date": medication.expiry_date
        }
    }


@router.delete("/{medication_id}")
def delete_medication(
    medication_id: int,
    admin_id: int,
    db: Session = Depends(get_db)
):
    return MedicationService.delete_medication(
        db=db,
        admin_id=admin_id,
        medication_id=medication_id
    )