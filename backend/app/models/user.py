from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Enum
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))

    role = Column(Enum("ADMIN", "MEMBER"), nullable=False, default="MEMBER")
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())