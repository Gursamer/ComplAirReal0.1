from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.utils.auth import (
    create_jwt,
    get_current_user,
    hash_password,
    load_users,
    save_users,
    verify_password,
)
from app.storage.db import get_user, upsert_user


router = APIRouter(prefix="/auth", tags=["auth"])


class SignupInput(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)


class LoginInput(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=128)


@router.post("/signup")
def signup(payload: SignupInput) -> dict:
    email = payload.email.lower().strip()
    if "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email")
    users = load_users()
    existing = get_user(email)

    if email in users or existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    password_hash = hash_password(payload.password)
    users[email] = {
        "password_hash": password_hash,
        "created_at": "now",
    }
    save_users(users)
    upsert_user(email, password_hash)

    token = create_jwt(email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"email": email},
    }


@router.post("/login")
def login(payload: LoginInput) -> dict:
    email = payload.email.lower().strip()
    if "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email")
    row = get_user(email)
    users = load_users()
    legacy_row = users.get(email)
    password_hash = str(row.get("password_hash", "")) if row else str((legacy_row or {}).get("password_hash", ""))

    if not password_hash or not verify_password(payload.password, password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Backfill SQLite when a legacy JSON-only account logs in.
    if not row and legacy_row:
        upsert_user(email, password_hash)

    token = create_jwt(email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"email": email},
    }


@router.get("/me")
def me(current_user=Depends(get_current_user)) -> dict:
    return {"user": {"email": current_user.email}}
