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
from fastapi.staticfiles import StaticFiles
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
    DBBusiness
)
from auth import get_auth_user, get_optional_auth_user
from jwt_utils import create_access_token, decode_access_token

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
    LoginResponse,
    InvestmentWithPurchasesOut,

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

RAW_IMAGE_ROOT = os.environ.get(
    "IMAGE_ROOT",
    "/data/business_images" if ENV == "production" else "./business_images"
)

# 🔒 sanitize whitespace / newlines
IMAGE_ROOT = RAW_IMAGE_ROOT.strip()
os.makedirs(IMAGE_ROOT, exist_ok=True)


# =========================
# DEBUG
# =========================
@app.get("/debug/file-check/{filename}")
def debug_file_check(filename: str):
    return {
        "env": ENV,
        "image_root": IMAGE_ROOT,
        "image_root_repr": repr(IMAGE_ROOT),
        "exists": os.path.exists(os.path.join(IMAGE_ROOT, filename)),
        "files": os.listdir(IMAGE_ROOT),
    }



# =========================
# ROUTES (UNCHANGED)
# =========================

# sign up

@app.post("/api/signup", response_model=LoginResponse, status_code=201)
async def signup(credentials: SignupCredentials, request: Request):
    # 1) Create the user (returns False if email already exists)
    created = create_user(credentials.name, credentials.email, credentials.password)
    if not created:
        raise HTTPException(status_code=409, detail="Email already registered")

    # 2) Create a session token (same flow as login)
    token = validate_email_password(credentials.email, credentials.password)
    if not token:
        raise HTTPException(status_code=500, detail="Failed to create session")

    # 3) Store session for cookie-based auth
    request.session["email"] = credentials.email
    request.session["session_token"] = token

    # 4) Also return JWT fallback (iOS / token mode)
    access_token = create_access_token(email=credentials.email, sid=token)

    return LoginResponse(
        success=True,
        message="Signup successful",
        access_token=access_token,
        token_type="bearer",
    )

@app.post("/api/login", response_model=LoginResponse)
async def login(credentials: LoginCredentials, request: Request):
    token = validate_email_password(credentials.email, credentials.password)
    if not token:
        raise HTTPException(status_code=401)

    # Desktop session still works
    request.session["email"] = credentials.email
    request.session["session_token"] = token

    # iOS JWT fallback
    access_token = create_access_token(email=credentials.email, sid=token)

    return LoginResponse(success=True, access_token=access_token, token_type="bearer")


@app.post("/api/logout", response_model=SuccessResponse)
async def logout(request: Request, response: Response):
    # 1) Prefer cookie session (desktop)
    email = request.session.get("email")
    token = request.session.get("session_token")

    # 2) Fallback to Bearer token (iOS JWT mode)
    if not email or not token:
        auth = request.headers.get("Authorization")
        if auth:
            parts = auth.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                payload = decode_access_token(parts[1])
                if payload:
                    email = payload.get("sub")
                    token = payload.get("sid")

    if email and token:
        invalidate_session(email, token)

    request.session.clear()

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


@app.get("/api/purchases", response_model=list[EnrichedPurchaseOut])
def get_purchases(
    status: PurchaseStatus = Query(...),
    current_user: UserPublicDetails = Depends(get_auth_user),
):
    return get_purchases_by_status(
        user_id=current_user.id,
        status=status
    )


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

@app.get("/api/business_investments", response_model=List[InvestmentWithPurchasesOut])
def get_business_investments(
    business_id: int = Query(...),
    db_session: Session = Depends(get_db),
):
    return db.get_investments_by_business_id(db_session, business_id)


@app.get("/api/my_business", response_model=BusinessOut)
def get_my_business(
    current_user: UserPublicDetails = Depends(get_auth_user),
    db_session: Session = Depends(get_db),
):
    business = (
        db_session.query(DBBusiness)
        .filter(DBBusiness.user_id == current_user.id)
        .first()
    )

    if not business:
        raise HTTPException(status_code=404, detail="No business for user")

    return business

# -------------------------------------------------
# Compatibility + Business Profile CRUD
#
# The frontend expects these routes for the “Edit Profile” page:
# - GET   /api/business/me            (prefill form)
# - POST  /api/business               (create business)
# - PATCH /api/business/{id}          (update details)
# - PATCH /api/business/{id}/image    (upload/replace image)
#
# Some parts of the client also call:
# - POST  /api/business/{id}/upload_image
#
# These were accidentally removed during refactors.
# -------------------------------------------------

@app.get("/api/business/me", response_model=BusinessOut)
def get_business_me(
    current_user: UserPublicDetails = Depends(get_auth_user),
    db_session: Session = Depends(get_db),
):
    """Return the current user's business (same behavior as /api/my_business)."""
    business = (
        db_session.query(DBBusiness)
        .filter(DBBusiness.user_id == current_user.id)
        .first()
    )

    if not business:
        raise HTTPException(status_code=404, detail="No business for user")

    return business


def save_business_image_for_id(business_id: int, file: UploadFile) -> str:
    ext = Path(file.filename).suffix.lower() if file.filename else ""
    if ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    # ✅ Deterministic filename like your Render disk convention
    filename = f"business_{business_id}{ext}"
    out_path = os.path.join(IMAGE_ROOT, filename)

    # (Optional but nice) remove other ext variants to prevent leftovers
    for other_ext in [".png", ".jpg", ".jpeg", ".webp"]:
        other_path = os.path.join(IMAGE_ROOT, f"business_{business_id}{other_ext}")
        if other_path != out_path and os.path.exists(other_path):
            os.remove(other_path)

    with open(out_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/images/{filename}"


# =========================
# IMAGE SERVING (Render disk)
# =========================

@app.get("/images/{filename}")
def serve_image(filename: str):
    path = os.path.join(IMAGE_ROOT, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Image not found")

    response = FileResponse(path)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@app.head("/images/{filename}")
def image_head(filename: str):
    path = os.path.join(IMAGE_ROOT, filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404)
    return Response(status_code=200)



@app.post("/api/business", response_model=BusinessOut)
def create_business_route(
    name: str = Form(...),
    website_url: str = Form(...),
    address1: str = Form(...),
    address2: Optional[str] = Form(None),
    city: str = Form(...),
    state: str = Form(...),
    postal_code: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: UserPublicDetails = Depends(get_auth_user),
    db_session: Session = Depends(get_db),
):
    existing = (
        db_session.query(DBBusiness)
        .filter(DBBusiness.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Business already exists for user")

    # 1) Create business FIRST (no image yet)
    business_in = BusinessCreate(
        name=name,
        user_id=current_user.id,
        website_url=website_url,
        image_url=None,
        address1=address1,
        address2=address2,
        city=city,
        state=state,
        postal_code=postal_code,
    )

    created = create_business(business_in)

    # 2) If image uploaded, save deterministically and update DB
    if image:
        image_url = save_business_image_for_id(created.id, image)
        db.update_business_image(
            business_id=created.id,
            user_id=current_user.id,
            image_url=image_url,
        )
        # keep response consistent
        created.image_url = image_url

    return created


@app.patch("/api/business/{business_id}", response_model=BusinessOut)
def patch_business_route(
    business_id: int,
    payload: BusinessPatch,
    current_user: UserPublicDetails = Depends(get_auth_user),
    db_session: Session = Depends(get_db),
):
    return update_business_details(
        db=db_session,
        business_id=business_id,
        user_id=current_user.id,
        updated_data=payload,
    )


@app.patch("/api/business/{business_id}/image")
def patch_business_image_route(
    business_id: int,
    image: UploadFile = File(...),
    current_user: UserPublicDetails = Depends(get_auth_user),
):
    image_url = save_business_image_for_id(business_id, image)
    db.update_business_image(
        business_id=business_id,
        user_id=current_user.id,
        image_url=image_url,
    )
    return {"image_url": image_url}



@app.post("/api/business/{business_id}/upload_image")
def post_business_image_route(
    business_id: int,
    image: UploadFile = File(...),
    current_user: UserPublicDetails = Depends(get_auth_user),
):
    """Alias for older frontend code that uploads via POST."""
    image_url = save_business_image_for_id(business_id, image)
    db.update_business_image(
        business_id=business_id,
        user_id=current_user.id,
        image_url=image_url,
    )
    return {"image_url": image_url}



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


@app.get("/api/financials/{business_id}", response_model=List[FinancialsOut])
def get_financials(business_id: int):
    return db.get_financials_by_business_id(business_id)

@app.post("/api/financials", response_model=FinancialsOut, status_code=201)
def create_financials(
    payload: FinancialsCreate,
    current_user: UserPublicDetails = Depends(get_auth_user),
):
    # Ensure the business exists and belongs to the logged-in user
    business = db.get_business(payload.business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    if business.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.add_finance(payload)
