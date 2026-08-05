from sqlalchemy import Column, Integer, Date, ForeignKey, JSON
from app.database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    family_member_id = Column(Integer, ForeignKey("family_members.id"))
    medication_id = Column(Integer, ForeignKey("medications.id"))

    frequency_days = Column(Integer)
    reminder_times = Column(JSON)
    start_date = Column(Date)