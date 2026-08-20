from sqlalchemy.orm import Session

from app.repositories.statistics_repo import StatisticsRepository


class StatisticsService:

    @staticmethod
    def get_statistics(
        db: Session,
        admin_id: int
    ):
        total_members = (
            StatisticsRepository.get_total_members(
                db,
                admin_id
            )
        )

        total_medications = (
            StatisticsRepository.get_total_medications(
                db,
                admin_id
            )
        )

        total_schedules = (
            StatisticsRepository.get_total_schedules(
                db,
                admin_id
            )
        )

        logs = StatisticsRepository.get_logs(
            db,
            admin_id
        )

        total_logs = len(logs)

        taken_logs = sum(
            1
            for log in logs
            if log.status == "Taken"
        )

        if total_logs == 0:
            overall_compliance = 0.0
        else:
            overall_compliance = (
                taken_logs / total_logs
            ) * 100

        member_compliance = (
            StatisticsRepository.get_member_compliance_data(
                db,
                admin_id
            )
        )

        low_stock = (
            StatisticsRepository.get_low_stock_medications(
                db,
                admin_id
            )
        )

        low_stock_result = []

        for medication, member in low_stock:
            low_stock_result.append({
                "medication_id": medication.id,
                "medication_name": medication.name,
                "stock_quantity": medication.stock_quantity,
                "min_threshold": medication.min_threshold,
                "member_id": member.id,
                "member_name": member.full_name
            })

        return {
            "overview": {
                "total_members": total_members,
                "total_medications": total_medications,
                "total_schedules": total_schedules,
                "overall_compliance": round(
                    overall_compliance,
                    2
                )
            },

            "member_compliance": member_compliance,

            "low_stock_medications": low_stock_result
        }