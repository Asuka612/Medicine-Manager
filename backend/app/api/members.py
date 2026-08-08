from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.member import (
    MemberCreate,
    MemberUpdate
)
from app.services.member_service import MemberService
from app.models.user import User


router = APIRouter(
    prefix="/api/members",
    tags=["Family Members"]
)


@router.post("/")
def create_member(
    data: MemberCreate,
    admin_id: int,
    db: Session = Depends(get_db)
):
    member, user = MemberService.create_member(
        db,
        admin_id,
        data
    )

    return {
        "message": "Tạo thành viên thành công.",
        "family_member": {
            "id": member.id,
            "member_id": member.member_id,
            "admin_id": member.admin_id,
            "full_name": member.full_name,
            "relationship": member.relationship,
            "medical_history_encrypted": member.medical_history_encrypted
        },
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "manager_id": user.manager_id
        }
    }


@router.get("/")
def get_members(
    admin_id: int,
    db: Session = Depends(get_db)
):
    members = MemberService.get_members(
        db,
        admin_id
    )

    result = []

    for member in members:
        user = (
            db.query(User)
            .filter(User.id == member.member_id)
            .first()
        )

        result.append({
            "id": member.id,
            "member_id": member.member_id,
            "admin_id": member.admin_id,
            "email": user.email if user else None,
            "full_name": member.full_name,
            "relationship": member.relationship,
            "medical_history_encrypted":
                member.medical_history_encrypted
        })

    return result


@router.get("/{family_member_id}")
def get_member(
    family_member_id: int,
    admin_id: int,
    db: Session = Depends(get_db)
):
    member = MemberService.get_member(
        db,
        admin_id,
        family_member_id
    )

    user = (
        db.query(User)
        .filter(User.id == member.member_id)
        .first()
    )

    return {
        "id": member.id,
        "member_id": member.member_id,
        "admin_id": member.admin_id,
        "email": user.email if user else None,
        "full_name": member.full_name,
        "relationship": member.relationship,
        "medical_history_encrypted":
            member.medical_history_encrypted
    }


@router.put("/{family_member_id}")
def update_member(
    family_member_id: int,
    data: MemberUpdate,
    admin_id: int,
    db: Session = Depends(get_db)
):
    member = MemberService.update_member(
        db,
        admin_id,
        family_member_id,
        data
    )

    return {
        "message": "Cập nhật thành viên thành công.",
        "member": {
            "id": member.id,
            "member_id": member.member_id,
            "admin_id": member.admin_id,
            "full_name": member.full_name,
            "relationship": member.relationship,
            "medical_history_encrypted":
                member.medical_history_encrypted
        }
    }


@router.delete("/{family_member_id}")
def delete_member(
    family_member_id: int,
    admin_id: int,
    db: Session = Depends(get_db)
):
    return MemberService.delete_member(
        db,
        admin_id,
        family_member_id
    )