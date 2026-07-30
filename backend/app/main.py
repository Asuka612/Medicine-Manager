from fastapi import FastAPI
from app.database import engine
from app.models import user, member, medication, schedule, log



app = FastAPI(title="Medicine Manager API", version="1.0")

@app.get("/")
def read_root():
    return {"message": "Hệ thống quản lý lịch dùng thuốc Backend đang hoạt động tốt!"}