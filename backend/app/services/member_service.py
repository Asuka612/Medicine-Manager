from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.models.member import FamilyMember
from app.repositories.member_repo import MemberRepository
from app.schemas.member import MemberCreate, MemberUpdate


class MemberService:

    @staticmethod
    def create_member(
        db: Session,
        admin_id: int,
        data: MemberCreate
    ):
        admin = (
            db.query(User)
            .filter(
                User.id == admin_id,
                User.role == "ADMIN"
            )
            .first()
        )

        if not admin:
            raise HTTPException(
                status_code=403,
                detail="Chỉ Admin mới có quyền tạo thành viên."
            )

        existing_user = MemberRepository.get_user_by_email(
            db,
            data.email
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email này đã được sử dụng."
            )

        try:
            new_user = MemberRepository.create_user(
                db=db,
                email=data.email,
                password_hash=data.password,
                full_name=data.full_name,
                manager_id=admin_id
            )

            family_member = MemberRepository.create_family_member(
                db=db,
                admin_id=admin_id,
                member_id=new_user.id,
                full_name=data.full_name,
                relationship=data.relationship,
                medical_history_encrypted=data.medical_history_encrypted
            )

            db.commit()
            db.refresh(family_member)
            db.refresh(new_user)

            return family_member, new_user

        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_members(
        db: Session,
        admin_id: int
    ):
        return MemberRepository.get_members_by_admin(
            db,
            admin_id
        )

    @staticmethod
    def get_member(
        db: Session,
        admin_id: int,
        family_member_id: int
    ):
        member = MemberRepository.get_member_by_id(
            db,
            family_member_id
        )

        if not member:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy thành viên."
            )

        if member.admin_id != admin_id:
            raise HTTPException(
                status_code=403,
                detail="Bạn không có quyền truy cập thành viên này."
            )

        return member

    @staticmethod
    def update_member(
        db: Session,
        admin_id: int,
        family_member_id: int,
        data: MemberUpdate
    ):
        member = MemberService.get_member(
            db,
            admin_id,
            family_member_id
        )

        if data.full_name is not None:
            member.full_name = data.full_name

        if data.relationship is not None:
            member.relationship = data.relationship

        if data.medical_history_encrypted is not None:
            member.medical_history_encrypted = (
                data.medical_history_encrypted
            )

        user = (
            db.query(User)
            .filter(User.id == member.member_id)
            .first()
        )

        if user and data.full_name is not None:
            user.full_name = data.full_name

        db.commit()
        db.refresh(member)

        return member

    @staticmethod
    def delete_member(
        db: Session,
        admin_id: int,
        family_member_id: int
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

        try:
            db.delete(member)

            if user:
                db.delete(user)

            db.commit()

            return {
                "message": "Xóa thành viên thành công."
            }

        except Exception:
            db.rollback()
            raise