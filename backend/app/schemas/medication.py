from pydantic import BaseModel
from typing import Optional
from datetime import date


class MedicationCreate(BaseModel):
    family_member_id: int
    name: str
    dosage: Optional[str] = None
    stock_quantity: int = 0
    min_threshold: int = 5
    expiry_date: Optional[date] = None


class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    stock_quantity: Optional[int] = None
    min_threshold: Optional[int] = None
    expiry_date: Optional[date] = None


class MedicationResponse(BaseModel):
    id: int
    family_member_id: int
    name: str
    dosage: Optional[str] = None
    stock_quantity: int
    min_threshold: int
    expiry_date: Optional[date] = None

    class Config:
        from_attributes = True