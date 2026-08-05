from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class UserAuthSchema(BaseModel):
    email: str
    password: str
    full_name: str = None
    role: str = "ADMIN"


@router.post("/register")
def register(user_data: UserAuthSchema, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký!")

    new_user = User(
        email=user_data.email,
        password_hash=user_data.password,
        full_name=user_data.full_name or "Người dùng",
        role=user_data.role,
        manager_id=None
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Đăng ký thành công!",
        "user_id": new_user.id
    }


@router.post("/login")
def login(user_data: UserAuthSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == user_data.email,
        User.password_hash == user_data.password
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Sai thông tin email hoặc mật khẩu!")

    return {
        "message": "Đăng nhập thành công!",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "manager_id": user.manager_id
        }
    }