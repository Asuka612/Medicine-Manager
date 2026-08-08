from pydantic import BaseModel
from typing import Optional


class MemberCreate(BaseModel):
    email: str
    password: str
    full_name: str
    relationship: Optional[str] = None
    medical_history_encrypted: Optional[str] = None


class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    relationship: Optional[str] = None
    medical_history_encrypted: Optional[str] = None


class MemberResponse(BaseModel):
    id: int
    member_id: int
    email: str
    full_name: str
    relationship: Optional[str] = None
    medical_history_encrypted: Optional[str] = None

    class Config:
        from_attributes = True