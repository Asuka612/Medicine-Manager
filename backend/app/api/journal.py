from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.services.journal_service import JournalService

from app.models.user import User
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/journal",
    tags=["Journal"]
)


@router.get("/")
def get_journal(
    family_member_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    admin_id = current_user.id

    return JournalService.get_journal(
        db=db,
        admin_id=admin_id,
        family_member_id=family_member_id
    )