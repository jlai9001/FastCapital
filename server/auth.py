from fastapi import HTTPException, Request
from db import validate_session
from pydantic_schemas import UserPublicDetails

def get_auth_user(request: Request) -> UserPublicDetails:
    email = request.session.get("email")
    session_token = request.session.get("session_token")

    if not email or not isinstance(email, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    if not session_token or not isinstance(session_token, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    if not db.validate_session(email, session_token):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Session expired or invalid")

    user = db.get_user_public_details(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user
