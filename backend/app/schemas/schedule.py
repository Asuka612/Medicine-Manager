from pydantic import BaseModel
from datetime import date
from typing import List


class ScheduleCreate(BaseModel):
    family_member_id: int
    medication_id: int
    frequency_days: int
    reminder_times: List[str]
    start_date: date
    end_date: date | None = None
    reminder_before_minutes: int = 10
    notification_message: str = "Tới giờ uống thuốc"


class ScheduleUpdate(BaseModel):
    medication_id: int | None = None
    frequency_days: int | None = None
    reminder_times: List[str] | None = None
    start_date: date | None = None
    end_date: date | None = None
    reminder_before_minutes: int | None = None
    notification_message: str | None = None


class ScheduleResponse(BaseModel):
    id: int
    family_member_id: int
    medication_id: int
    frequency_days: int
    reminder_times: List[str]
    start_date: date
    end_date: date | None
    reminder_before_minutes: int
    notification_message: str

    class Config:
        from_attributes = True