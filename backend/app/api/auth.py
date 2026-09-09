from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


class UserAuthSchema(BaseModel):
    email: str
    password: str
    full_name: str = None
    role: str = "ADMIN"


@router.post("/register")
def register(
    user_data: UserAuthSchema,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email này đã được đăng ký!"
        )

    hashed_password = hash_password(
        user_data.password
    )

    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
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
def login(
    user_data: UserAuthSchema,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Sai thông tin email hoặc mật khẩu!"
        )

    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Sai thông tin email hoặc mật khẩu!"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
            "email": user.email
        }
    )

    return {
        "message": "Đăng nhập thành công!",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "manager_id": user.manager_id
        }
    }