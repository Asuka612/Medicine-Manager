from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database import Base

class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String(100))
    relationship = Column(String(50))
    medical_history_encrypted = Column(Text)