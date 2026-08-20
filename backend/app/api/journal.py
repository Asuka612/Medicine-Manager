from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.journal_service import JournalService


router = APIRouter(
    prefix="/api/journal",
    tags=["Journal"]
)


@router.get("/")
def get_journal(
    admin_id: int,
    family_member_id: int | None = None,
    db: Session = Depends(get_db)
):
    return JournalService.get_journal(
        db=db,
        admin_id=admin_id,
        family_member_id=family_member_id
    )