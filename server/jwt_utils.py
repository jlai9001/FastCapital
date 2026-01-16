import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt

JWT_ALG = "HS256"
JWT_EXPIRE_MINUTES = int(os.environ.get("JWT_EXPIRE_MINUTES", "30"))


def _get_jwt_secret() -> str:
    # Prefer JWT_SECRET, but fall back to SESSION_SECRET to avoid extra env churn.
    return (
        os.environ.get("JWT_SECRET")
        or os.environ.get("SESSION_SECRET")
        or "dev-jwt-secret"
    )


def create_access_token(*, email: str, sid: str) -> str:
    """Create a short-lived access token.

    We embed `sid` (the DB-backed session_token) so that:
      - logout invalidates JWTs immediately (because sid no longer matches)
      - we can reuse your existing validate_session() sliding-expiration logic
    """
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=JWT_EXPIRE_MINUTES)

    payload: dict[str, Any] = {
        "sub": email,
        "sid": sid,
        "iat": int(now.timestamp()),
        "exp": exp,
    }
    return jwt.encode(payload, _get_jwt_secret(), algorithm=JWT_ALG)


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    try:
        return jwt.decode(token, _get_jwt_secret(), algorithms=[JWT_ALG])
    except JWTError:
        return None
