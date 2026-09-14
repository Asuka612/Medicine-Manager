import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models.user import User
from app.api.auth import router


TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

app = FastAPI()
app.include_router(router)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "admin@test.com",
            "password": "TestPassword123!",
            "full_name": "Admin Test",
            "role": "ADMIN",
        },
    )

    assert response.status_code == 200
    body = response.json()

    assert body["message"] == "Đăng ký thành công!"
    assert body["user_id"] is not None

    db = TestingSessionLocal()
    try:
        user = (
            db.query(User)
            .filter(User.email == "admin@test.com")
            .first()
        )

        assert user is not None
        assert user.full_name == "Admin Test"
        assert user.role == "ADMIN"
        assert user.password_hash != "TestPassword123!"
    finally:
        db.close()


def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@test.com",
        "password": "TestPassword123!",
        "full_name": "Duplicate Test",
        "role": "ADMIN",
    }

    first_response = client.post(
        "/api/auth/register",
        json=payload,
    )
    second_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert first_response.status_code == 200
    assert second_response.status_code == 400
    assert second_response.json()["detail"] == "Email này đã được đăng ký!"


def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "login@test.com",
            "password": "TestPassword123!",
            "full_name": "Login Test",
            "role": "ADMIN",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "login@test.com",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 200
    body = response.json()

    assert body["message"] == "Đăng nhập thành công!"
    assert body["access_token"]
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "login@test.com"
    assert body["user"]["role"] == "ADMIN"


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "wrongpw@test.com",
            "password": "CorrectPassword123!",
            "full_name": "Wrong Password",
            "role": "ADMIN",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email": "wrongpw@test.com",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Sai thông tin email hoặc mật khẩu!"


def test_login_unknown_email(client):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "unknown@test.com",
            "password": "TestPassword123!",
        },
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Sai thông tin email hoặc mật khẩu!"
