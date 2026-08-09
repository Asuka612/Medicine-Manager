from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, DateTime
from app.database import Base


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    schedule_id = Column(
        Integer,
        ForeignKey("schedules.id")
    )

    status = Column(
        String(20),
        default="Pending"
    )

    scheduled_time = Column(DateTime)

    action_time = Column(DateTime)