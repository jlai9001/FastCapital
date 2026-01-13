from fastapi import HTTPException, Request, status
import db
from pydantic_schemas import UserPublicDetails


def get_auth_user(request: Request) -> UserPublicDetails:
    """
    Get the authenticated user from the request session.
    Raises:
        HTTPException: If the user is not authenticated or session is invalid.
    """
    email = request.session.get("email")
    session_token = request.session.get("session_token")

    # print("SESSION CONTENTS:", request.session)

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
    email = request.session.get("email")
    session_token = request.session.get("session_token")

    if not email or not session_token:
        return None

    if not db.validate_session(email, session_token):
        return None

    return db.get_user_public_details(email)
