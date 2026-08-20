from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.statistics_service import StatisticsService


router = APIRouter(
    prefix="/api/statistics",
    tags=["Statistics"]
)


@router.get("/")
def get_statistics(
    admin_id: int,
    db: Session = Depends(get_db)
):
    return StatisticsService.get_statistics(
        db=db,
        admin_id=admin_id
    )