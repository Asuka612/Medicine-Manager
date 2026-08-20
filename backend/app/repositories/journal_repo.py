from sqlalchemy.orm import Session

from app.models.log import Log
from app.models.schedule import Schedule
from app.models.medication import Medication
from app.models.member import FamilyMember


class JournalRepository:

    @staticmethod
    def get_logs(
        db: Session,
        admin_id: int,
        family_member_id: int = None
    ):
        query = (
            db.query(
                Log,
                Schedule,
                Medication,
                FamilyMember
            )
            .join(
                Schedule,
                Log.schedule_id == Schedule.id
            )
            .join(
                Medication,
                Schedule.medication_id == Medication.id
            )
            .join(
                FamilyMember,
                Schedule.family_member_id == FamilyMember.id
            )
            .filter(
                FamilyMember.admin_id == admin_id
            )
        )

        if family_member_id is not None:
            query = query.filter(
                FamilyMember.id == family_member_id
            )

        return query.order_by(
            Log.scheduled_time.desc()
        ).all()