from sqlalchemy.orm import Session

from app.models.member import FamilyMember
from app.models.medication import Medication
from app.models.schedule import Schedule
from app.models.log import Log


class StatisticsRepository:

    @staticmethod
    def get_total_members(
        db: Session,
        admin_id: int
    ):
        return (
            db.query(FamilyMember)
            .filter(
                FamilyMember.admin_id == admin_id
            )
            .count()
        )

    @staticmethod
    def get_total_medications(
        db: Session,
        admin_id: int
    ):
        return (
            db.query(Medication)
            .join(
                FamilyMember,
                Medication.family_member_id == FamilyMember.id
            )
            .filter(
                FamilyMember.admin_id == admin_id
            )
            .count()
        )

    @staticmethod
    def get_total_schedules(
        db: Session,
        admin_id: int
    ):
        return (
            db.query(Schedule)
            .join(
                FamilyMember,
                Schedule.family_member_id == FamilyMember.id
            )
            .filter(
                FamilyMember.admin_id == admin_id
            )
            .count()
        )

    @staticmethod
    def get_logs(
        db: Session,
        admin_id: int
    ):
        return (
            db.query(Log)
            .join(
                Schedule,
                Log.schedule_id == Schedule.id
            )
            .join(
                FamilyMember,
                Schedule.family_member_id == FamilyMember.id
            )
            .filter(
                FamilyMember.admin_id == admin_id
            )
            .all()
        )

    @staticmethod
    def get_member_compliance_data(
        db: Session,
        admin_id: int
    ):
        members = (
            db.query(FamilyMember)
            .filter(
                FamilyMember.admin_id == admin_id
            )
            .all()
        )

        result = []

        for member in members:
            schedules = (
                db.query(Schedule.id)
                .filter(
                    Schedule.family_member_id == member.id
                )
                .all()
            )

            schedule_ids = [
                row[0]
                for row in schedules
            ]

            if not schedule_ids:
                result.append({
                    "member_id": member.id,
                    "member_name": member.full_name,
                    "compliance_rate": 0.0
                })
                continue

            total_logs = (
                db.query(Log)
                .filter(
                    Log.schedule_id.in_(schedule_ids)
                )
                .count()
            )

            if total_logs == 0:
                compliance_rate = 0.0
            else:
                taken_logs = (
                    db.query(Log)
                    .filter(
                        Log.schedule_id.in_(schedule_ids),
                        Log.status == "Taken"
                    )
                    .count()
                )

                compliance_rate = (
                    taken_logs / total_logs
                ) * 100

            result.append({
                "member_id": member.id,
                "member_name": member.full_name,
                "compliance_rate": round(
                    compliance_rate,
                    2
                )
            })

        return result

    @staticmethod
    def get_low_stock_medications(
        db: Session,
        admin_id: int
    ):
        return (
            db.query(
                Medication,
                FamilyMember
            )
            .join(
                FamilyMember,
                Medication.family_member_id == FamilyMember.id
            )
            .filter(
                FamilyMember.admin_id == admin_id,
                Medication.stock_quantity <= Medication.min_threshold
            )
            .order_by(
                Medication.stock_quantity.asc()
            )
            .all()
        )