from sqlalchemy.orm import Session
from app.models.user import User

class UserRepository:
    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create_user(db: Session, email: str, password_hash: str, full_name: str):
        db_user = User(email=email, password_hash=password_hash, full_name=full_name)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user