# =========================
# Standard library
# =========================
import os
import shutil
from pathlib import Path
from typing import List, Optional
from secrets import token_urlsafe

# =========================
# Third-party
# =========================
from fastapi import (
    FastAPI,
    Request,
    Response,
    HTTPException,
    Depends,
    Query,
    UploadFile,
    File,
    Form,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy.orm import Session
from rich import print

# =========================
# Internal
# =========================
import db
from db import (
    get_db,
    get_purchases_by_status,
    create_user,
    create_business,
    invalidate_session,
    validate_email_password,
    update_business_details,
)
from auth import get_auth_user, get_optional_auth_user
from pydantic_schemas import (
    InvestmentOut,
    BusinessCreate,
    BusinessPatch,
    BusinessOut,
    FinancialsCreate,
    FinancialsOut,
    InvestmentCreate,
    InvestmentWithPurchasesOut,
    PurchaseCreate,
    EnrichedPurchaseOut,
    LoginCredentials,
    SignupCredentials,
    SuccessResponse,
    SecretResponse,
    UserPublicDetails,
    PurchaseStatus,
)

# =========================
# ENV / APP SETUP
# =========================
ENV = os.environ.get("ENV", "development")

app = FastAPI(
    docs_url=None if ENV == "production" else "/docs",
    redoc_url=None if ENV == "production" else "/redoc",
    openapi_url=None if ENV == "production" else "/openapi.json",
)

SESSION_SECRET = os.environ.get("SESSION_SECRET")
if ENV == "production" and not SESSION_SECRET:
    raise RuntimeError("SESSION_SECRET must be set in production")

# =========================
# CORS — MUST BE FIRST (iOS REQUIREMENT)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fastcapital-client.onrender.com",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# SESSION — MUST BE SECOND
# =========================
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET or "dev-secret",
    session_cookie="session",
    max_age=None,
    same_site="none",     # REQUIRED for cross-site cookies
    https_only=True,      # REQUIRED by Safari
)

# =========================
# CSRF — MUST BE LAST
# =========================
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        # Always allow CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)

        # Skip CSRF for API routes (SPA-safe)
        if request.url.path.startswith("/api/"):
            return await call_next(request)

        # Allow safe methods
        if request.method in SAFE_METHODS:
            response = await call_next(request)

            if "csrf_token" not in request.cookies:
                token = token_urlsafe(32)
                response.set_cookie(
                    "csrf_token",
                    token,
                    httponly=False,
                    secure=ENV == "production",
                    samesite="lax",
                )
            return response

        csrf_cookie = request.cookies.get("csrf_token")
        csrf_header = request.headers.get("X-CSRF-Token")

        if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
            raise HTTPException(status_code=403, detail="CSRF validation failed")

        return await call_next(request)

app.add_middleware(CSRFMiddleware)

# =========================
# FILE STORAGE
# =========================
IMAGE_ROOT = "/data/business_images"
os.makedirs(IMAGE_ROOT, exist_ok=True)

@app.get("/images/{filename}")
def serve_image(filename: str):
    path = os.path.join(IMAGE_ROOT, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)

@app.head("/images/{filename}")
def image_head(filename: str):
    path = os.path.join(IMAGE_ROOT, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404)
    return Response(status_code=200)

# =========================
# DEBUG
# =========================
@app.get("/debug/file-check/{filename}")
def debug_file_check(filename: str):
    return {
        "exists": os.path.exists(os.path.join(IMAGE_ROOT, filename)),
        "cwd": os.getcwd(),
        "files": os.listdir(IMAGE_ROOT),
    }

# =========================
# ROUTES (UNCHANGED)
# =========================

@app.post("/api/login", response_model=SuccessResponse)
async def login(credentials: LoginCredentials, request: Request):
    token = validate_email_password(credentials.email, credentials.password)
    if not token:
        raise HTTPException(status_code=401)

    request.session["email"] = credentials.email
    request.session["session_token"] = token
    return SuccessResponse(success=True)

@app.post("/api/logout", response_model=SuccessResponse)
async def logout(request: Request, response: Response):
    email = request.session.get("email")
    token = request.session.get("session_token")
    if email and token:
        invalidate_session(email, token)

    request.session.clear()

    # Force browser to drop the cookie (Safari can otherwise keep it)
    response.delete_cookie(
        key="session",
        path="/",
        samesite="none",
        secure=True,
    )

    return SuccessResponse(success=True)


@app.get("/api/me", response_model=Optional[UserPublicDetails])
async def get_me(current_user: Optional[UserPublicDetails] = Depends(get_optional_auth_user)):
    return current_user

@app.get(
    "/api/secret",
    response_model=SecretResponse,
    dependencies=[Depends(get_auth_user)],
)
async def secret():
    return SecretResponse(secret="info")


@app.get("/api/investment", response_model=List[InvestmentOut])
async def get_investments():
    return db.get_investments()

@app.get("/api/business", response_model=List[BusinessOut])
async def get_businesses():
    return db.get_businesses()

@app.get("/api/business/{business_id}", response_model=BusinessOut)
async def get_business_by_id(business_id: int):
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

@app.get("/api/investment/{investment_id}", response_model=InvestmentWithPurchasesOut)
def investment_detail(
    investment_id: int,
    db_session: Session = Depends(get_db)
):
    investment = db.get_investment_by_id(db_session, investment_id)

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    return investment
