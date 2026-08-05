from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    family_member_id = Column(Integer, ForeignKey("family_members.id"))

    name = Column(String(100))
    dosage = Column(String(50))
    stock_quantity = Column(Integer)
    min_threshold = Column(Integer, default=5)
    expiry_date = Column(Date)