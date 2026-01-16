from fastapi import HTTPException, Request, status

import db
from jwt_utils import decode_access_token
from pydantic_schemas import UserPublicDetails


def _get_bearer_token(request: Request) -> str | None:
    auth = request.headers.get("Authorization")
    if not auth:
        return None

    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def get_auth_user(request: Request) -> UserPublicDetails:
    """
    Auth required.
    Accepts either:
      - session cookie (desktop)
      - Authorization: Bearer <jwt> (iOS fallback)
    """
    # 1) Prefer cookie session (desktop)
    email = request.session.get("email")
    session_token = request.session.get("session_token")

    # 2) Fallback to JWT header (iOS token mode)
    if (not email or not session_token) and (bearer := _get_bearer_token(request)):
        payload = decode_access_token(bearer)
        if payload:
            email = payload.get("sub")
            session_token = payload.get("sid")

    if not email or not isinstance(email, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    if not session_token or not isinstance(session_token, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    if not db.validate_session(email, session_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid"
        )

    user = db.get_user_public_details(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user


def get_optional_auth_user(request: Request) -> UserPublicDetails | None:
    """
    Optional authentication.
    Returns user if logged in, otherwise returns None.
    NEVER raises 401.
    """
    # 1) Prefer cookie session
    email = request.session.get("email")
    session_token = request.session.get("session_token")

    # 2) Fallback to JWT
    if not email or not session_token:
        bearer = _get_bearer_token(request)
        if not bearer:
            return None

        payload = decode_access_token(bearer)
        if not payload:
            return None

        email = payload.get("sub")
        session_token = payload.get("sid")

    if not isinstance(email, str) or not isinstance(session_token, str):
        return None

    if not db.validate_session(email, session_token):
        return None

    return db.get_user_public_details(email)
