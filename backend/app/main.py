from fastapi import FastAPI
from app.database import engine
from app.api import schedules, medications, auth

app = FastAPI(title="Medicine Manager API", version="1.0")

app.include_router(schedules.router)
# app.include_router(medications.router)
# app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Hệ thống quản lý lịch dùng thuốc Backend đang hoạt động tốt!"}