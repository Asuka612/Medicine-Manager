from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.schedule_service import confirm_taken_log
from app.services.compliance_service import calculate_member_compliance

router = APIRouter(prefix="/api/schedules", tags=["Schedules & Compliance"])

# 1.Xác nhận 
@router.post("/logs/{log_id}/take")
def api_confirm_taken(log_id: int, db: Session = Depends(get_db)):
    result = confirm_taken_log(db, log_id)
    return result

# 2.Tính toán tỷ lệ tuân thủ điều trị 
@router.get("/compliance/{member_id}")
def api_get_compliance(member_id: int, db: Session = Depends(get_db)):
    result = calculate_member_compliance(db, member_id)
    return result