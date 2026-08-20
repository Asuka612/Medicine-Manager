from fastapi import FastAPI
from app.api import members
from app.api import member_dashboard
from app.api import medications
from app.database import engine
from app.api import schedules, medications, auth
from fastapi.middleware.cors import CORSMiddleware
from app.api import journal
from app.api import statistics
app = FastAPI(title="Medicine Manager API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép mọi nguồn truy cập (hoặc điền ["http://localhost:5173"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(schedules.router)
app.include_router(members.router)
app.include_router(medications.router)
app.include_router(auth.router)
app.include_router(member_dashboard.router)
app.include_router(journal.router)
app.include_router(statistics.router)
@app.get("/")
def read_root():
    return {"message": "Hệ thống quản lý lịch dùng thuốc Backend đang hoạt động tốt!"}