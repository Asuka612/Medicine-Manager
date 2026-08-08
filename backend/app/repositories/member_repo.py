from sqlalchemy.orm import Session
from app.models.member import FamilyMember
from app.models.user import User


class MemberRepository:

    @staticmethod
    def get_members_by_admin(db: Session, admin_id: int):
        return (
            db.query(FamilyMember)
            .filter(FamilyMember.admin_id == admin_id)
            .all()
        )

    @staticmethod
    def get_member_by_id(db: Session, member_record_id: int):
        return (
            db.query(FamilyMember)
            .filter(FamilyMember.id == member_record_id)
            .first()
        )

    @staticmethod
    def get_member_by_user_id(db: Session, member_id: int):
        return (
            db.query(FamilyMember)
            .filter(FamilyMember.member_id == member_id)
            .first()
        )

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    @staticmethod
    def create_user(
        db: Session,
        email: str,
        password_hash: str,
        full_name: str,
        manager_id: int
    ):
        user = User(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role="MEMBER",
            manager_id=manager_id
        )

        db.add(user)
        db.flush()

        return user

    @staticmethod
    def create_family_member(
        db: Session,
        admin_id: int,
        member_id: int,
        full_name: str,
        relationship: str,
        medical_history_encrypted: str = None
    ):
        family_member = FamilyMember(
            admin_id=admin_id,
            member_id=member_id,
            full_name=full_name,
            relationship=relationship,
            medical_history_encrypted=medical_history_encrypted
        )

        db.add(family_member)

        return family_member

    @staticmethod
    def delete_family_member(db: Session, family_member):
        db.delete(family_member)