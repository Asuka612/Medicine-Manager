from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.statistics_service import StatisticsService
from app.models.user import User
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/statistics",
    tags=["Statistics"]
)


@router.get("/")
def get_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    admin_id = current_user.id

    return StatisticsService.get_statistics(
        db=db,
        admin_id=admin_id
    )