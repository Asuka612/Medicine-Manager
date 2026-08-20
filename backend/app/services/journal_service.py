from sqlalchemy.orm import Session

from app.repositories.journal_repo import JournalRepository


class JournalService:

    @staticmethod
    def get_journal(
        db: Session,
        admin_id: int,
        family_member_id: int = None
    ):
        rows = JournalRepository.get_logs(
            db=db,
            admin_id=admin_id,
            family_member_id=family_member_id
        )

        result = []

        for log, schedule, medication, member in rows:
            result.append({
                "log_id": log.id,
                "member_id": member.id,
                "member_name": member.full_name,

                "schedule_id": schedule.id,

                "medication_id": medication.id,
                "medication_name": medication.name,
                "dosage": medication.dosage,

                "scheduled_time": log.scheduled_time,
                "action_time": log.action_time,
                "status": log.status
            })

        return result