from datetime import timedelta

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


def test_password_hash_and_verify():
    plain_password = "TestPassword123!"
    hashed_password = hash_password(plain_password)

    assert hashed_password != plain_password
    assert verify_password(plain_password, hashed_password) is True
    assert verify_password("WrongPassword", hashed_password) is False


def test_create_and_decode_access_token():
    payload = {
        "sub": "1",
        "role": "ADMIN",
        "email": "admin@test.com",
    }

    token = create_access_token(
        data=payload,
        expires_delta=timedelta(minutes=5),
    )

    decoded = decode_access_token(token)

    assert decoded is not None
    assert decoded["sub"] == "1"
    assert decoded["role"] == "ADMIN"
    assert decoded["email"] == "admin@test.com"
    assert "exp" in decoded


def test_decode_invalid_token_returns_none():
    decoded = decode_access_token("this-is-not-a-valid-jwt")
    assert decoded is None
