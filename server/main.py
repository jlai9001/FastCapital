from secrets import token_urlsafe
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import (
    Response,
    Request,
    HTTPException,
    FastAPI,
    Query,
    Depends,
    status,
    UploadFile,
    File,
    Form,
)

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from starlette.middleware.sessions import SessionMiddleware
from pydantic_schemas import (
    InvestmentOut,
    BusinessOut,
    FinancialsCreate,
    FinancialsOut,
    PurchaseCreate,
    EnrichedPurchaseOut,
    SuccessResponse,
    LoginCredentials,
    SecretResponse,
    UserPublicDetails,
    InvestmentCreate,
    SignupCredentials,
    BusinessCreate,
    InvestmentWithPurchasesOut,
    BusinessUpdate,
)
from pathlib import Path
from typing import List, Optional
import db
import uuid, os, shutil
from db import (
    get_purchases_by_status,
    create_user,
    create_business,
    invalidate_session,
    validate_email_password,
    get_db,
    update_business_image,
    update_business_details,
)
from db_models import DBBusiness, DBInvestment
from pydantic_schemas import PurchaseStatus
from auth import get_auth_user,get_optional_auth_user
from rich import print

# add ENV detection
ENV = os.environ.get("ENV","development")

FRONTEND_ORIGIN = os.environ.get(
    "CORS_ORIGIN",
    "http://localhost:5173" if ENV != "production" else None
)

# disable docs for production
app = FastAPI(
    docs_url=None if ENV == "production" else "/docs",
    redoc_url=None if ENV == "production" else "/redoc",
    openapi_url=None if ENV == "production" else "/openapi.json",
)

if not FRONTEND_ORIGIN:
    raise RuntimeError("CORS_ORIGIN env var must be set")



UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount(
    "/uploaded_images", StaticFiles(directory="uploaded_images"), name="uploaded_images"
)

SESSION_SECRET = os.environ.get("SESSION_SECRET")

if ENV == "production" and not SESSION_SECRET:
    raise RuntimeError("SESSION_SECRET must be set in production")

# Hardened SessionMiddleWare (Updated - 2026)
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET or "dev-secret",
    session_cookie="session",
    max_age = None,
    same_site="none",
    https_only=True,
)

image_base_url = os.environ.get("IMAGE_BASE_URL", "http://localhost:8000")

# CSRF middleware

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        # ✅ FIX: allow CORS preflight immediately
        if request.method == "OPTIONS":
            return await call_next(request)

        # SAFE read-only methods
        if request.method in {"GET", "HEAD"}:
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

        # Auth bootstrap routes
        if request.url.path in {"/api/login", "/api/signup", "/api/logout"}:
            return await call_next(request)
        # 3️⃣ ENFORCE CSRF on unsafe methods
        csrf_cookie = request.cookies.get("csrf_token")
        csrf_header = request.headers.get("X-CSRF-Token")

        if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
            raise HTTPException(
                status_code=403,
                detail="CSRF validation failed"
            )

        return await call_next(request)

# Register CSRF middleware
app.add_middleware(CSRFMiddleware)

# =========================
# CORS (MUST COME LAST)
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

# Add CSRF token endpoint
@app.get("/api/csrf")
def get_csrf_token(response: Response):
    token = token_urlsafe(32)
    response.set_cookie(
        "csrf_token",
        token,
        httponly=False,
        secure=ENV == "production",
        samesite="lax",
    )
    return {"csrf_token": token}

@app.get("/api/investment/{investment_id}")
async def get_investment(investment_id: int) -> InvestmentOut:
    """
    Fetches a specific investment by its ID.
    If the investment does not exist, raises a 404 error.
    """
    investment = db.get_investment(investment_id)
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    return investment


@app.get("/api/business_investments", response_model=List[InvestmentWithPurchasesOut])
async def get_investments_by_business(
    business_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: Optional[UserPublicDetails] = Depends(get_optional_auth_user),
):
    investments = (
        db.query(DBInvestment)
        .options(joinedload(DBInvestment.purchases))
        .filter(DBInvestment.business_id == business_id)
        .all()
    )

    return investments


@app.get("/api/investment")
async def get_investments() -> list[InvestmentOut]:
    """
    Fetches all investments.
    Returns a list of investments.
    """
    return db.get_investments()


@app.post(
    "/api/business", response_model=BusinessOut, status_code=status.HTTP_201_CREATED
)
async def create_business_api(
    name: str = Form(...),
    website_url: str = Form(...),
    image: UploadFile = File(...),
    address1: str = Form(...),
    address2: str = Form(None),
    city: str = Form(...),
    state: str = Form(...),
    postal_code: str = Form(...),
    current_user: UserPublicDetails = Depends(get_auth_user),
) -> BusinessOut:
    """
    Create a new business with the provided details.
    The business will be associated with the currently authenticated user.
    The image will be saved to the local storage and its URL will be returned.
    """
    try:
        filename = f"{uuid.uuid4().hex}_{image.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f'{image_base_url}/uploaded_images/{filename}'
        # Add env variable api.fastcapital.site

        business_data = {
            "name": name,
            "user_id": current_user.id,
            "website_url": website_url,
            "image_url": image_url,
            "address1": address1,
            "address2": address2,
            "city": city,
            "state": state,
            "postal_code": postal_code,
        }

        return create_business(BusinessCreate(**business_data))

    except Exception as e:
        print(f"Error creating business: {e}")
        raise HTTPException(status_code=500, detail="Failed to create business.")


@app.post("/api/business/{business_id}/upload_image")
async def upload_business_image(
    business_id: int,
    image: UploadFile = File(...),
    current_user: UserPublicDetails = Depends(get_auth_user),
):
    """
    Uploads an image for a specific business.
    The image will be saved to the local storage and its URL will be updated
    in the business record.
    Rais for various error conditions.
    """
    try:

        filename = f"{uuid.uuid4().hex}_{image.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f"{image_base_url}/uploaded_images/{filename}"

        updated_url = update_business_image(
            business_id=business_id, user_id=current_user.id, image_url=image_url
        )

        return {"image_url": updated_url}

    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        print(f"Unhandled error during image upload: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image.")

@app.get("/api/business/me", response_model=BusinessOut)
def get_my_business_by_request(
    current_user: UserPublicDetails = Depends(get_auth_user),
    db: Session = Depends(get_db),
):
    business = (
        db.query(DBBusiness)
        .filter(DBBusiness.user_id == current_user.id)
        .first()
    )
    if not business:
        raise HTTPException(
            status_code=404,
            detail="No business linked to this user"
        )
    return business

@app.get("/api/business/{business_id}")
async def get_business(business_id: int) -> BusinessOut:
    """
    Fetches a specific business by its ID.
    If the business does not exist, raises a 404 error.
    """
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business

@app.put("/api/business/{business_id}", response_model=BusinessOut)
async def put_business(
    business_id: int,
    updated_business: BusinessUpdate,
    db: Session = Depends(get_db),
    current_user: UserPublicDetails = Depends(get_auth_user),
) -> BusinessOut:
    return update_business_details(
        db=db,
        business_id=business_id,
        user_id=current_user.id,
        updated_data=updated_business,
    )

@app.get("/api/business", response_model=List[BusinessOut])
async def get_businesses():
    return db.get_businesses()


@app.get("/api/purchases", response_model=List[EnrichedPurchaseOut])
async def get_user_purchases(
    status: PurchaseStatus = Query(PurchaseStatus.pending),
    current_user: UserPublicDetails = Depends(get_auth_user),
):
    """
    Fetches all purchases for the current user filtered by status.
    The status can be 'pending', 'completed', or 'cancelled'.
    Returns a list of enriched purchases.
    """
    user_id = current_user.id
    purchases = get_purchases_by_status(user_id, status)
    return purchases


@app.get("/api/financials/{business_id}", response_model=list[FinancialsOut])
def get_financials_for_business(business_id: int):
    """
    Fetches financial records for a specific business by its ID.
    If no financial records are found, raises a 404 error.
    """
    financials = db.get_financials_by_business_id(business_id)
    if not financials:
        raise HTTPException(status_code=404, detail="Financials not found for business")
    return financials


@app.post(
    "/api/purchases", status_code=201
)
async def post_purchase(purchase_request: PurchaseCreate):
    """
    Creates a new purchase.
    The purchase_request should contain the necessary details for the purchase.
    If the purchase cannot be created due to insufficient shares, raises a 400 error.
    If any other error occurs, raises a 500 error.
    """
    try:
        purchase = db.add_purchase(purchase_request)
        return purchase
    except Exception as e:
        if str(e) == "NotEnoughSharesException":
            raise HTTPException(status_code=400, detail="Not enough shares available.")
        else:
            print(f"Unexpected error: {e}")
            raise HTTPException(
                status_code=500, detail="Something went wrong on the server."
            )


@app.post("/api/financials/", status_code=201)
async def post_financials(new_finance: FinancialsCreate):
    """
    Creates a new financial record.
    The new_finance should contain the necessary details for the financial record.
    If the financial record cannot be created due to validation errors,
    raises a 400 error.
    If any other error occurs, raises a 500 error.
    """
    try:
        finance = db.add_finance(new_finance)
        return finance
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail="Something went wrong on the server."
        )


@app.post("/api/investment", status_code=201)
async def post_investment(new_investment: InvestmentCreate):
    """
    Creates a new investment.
    The new_investment should contain the necessary details for the investment.
    If the investment cannot be created due to validation errors,
    raises a 400 error.
    If any other error occurs, raises a 500 error.
    """
    try:
        investment = db.add_investment(new_investment)
        return investment
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Server could not post investment.")


@app.post("/api/login", response_model=SuccessResponse)
async def login(credentials: LoginCredentials, request: Request) -> SuccessResponse:
    """
    Handle user login.
    Validates credentials, creates a session, and stores session info
    in cookies. Returns success if login is valid, else raises 401.
    """
    email = credentials.email
    password = credentials.password
    new_session_token = validate_email_password(email, password)

    if not new_session_token:
        raise HTTPException(status_code=401)

    request.session["email"] = email
    request.session["session_token"] = new_session_token
    return SuccessResponse(success=True)


@app.post("/api/logout", response_model=SuccessResponse)
async def logout(request: Request) -> SuccessResponse:
    """
    Handle user logout.
    Invalidates the session in the database and clears session data
    from cookies. Returns success status.
    """
    email = request.session.get("email")
    if not email or not isinstance(email, str):
        return SuccessResponse(success=False)
    session_token = request.session.get("session_token")
    if not session_token or not isinstance(session_token, str):
        return SuccessResponse(success=False)
    invalidate_session(email, session_token)

    request.session.clear()
    return SuccessResponse(success=True)


@app.post("/api/signup", response_model=SuccessResponse)
async def signup(credentials: SignupCredentials, request: Request) -> SuccessResponse:
    """
    Handle user signup.
    Validates the provided credentials, creates a new user,
    and automatically logs in the user by creating a session.
    Returns success if signup is valid, else raises 400 or 409.
    """
    name = credentials.name
    email = credentials.email
    password = credentials.password
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    success = create_user(name, email, password)
    if not success:
        raise HTTPException(status_code=409, detail="Email already exists")
    new_session_token = validate_email_password(email, password)
    request.session["email"] = email
    request.session["session_token"] = new_session_token
    return SuccessResponse(success=True)


from typing import Optional

@app.get("/api/me", response_model=Optional[UserPublicDetails])
async def get_me(
    current_user: Optional[UserPublicDetails] = Depends(get_optional_auth_user),
):
    return current_user

@app.get("/api/my_business", response_model=BusinessOut)
async def get_my_business(
    current_user: UserPublicDetails = Depends(get_auth_user),
    db: Session = Depends(get_db),
):
    business = (
        db.query(DBBusiness)
        .filter(DBBusiness.user_id == current_user.id)
        .first()
    )

    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    return business


# This is how to declare that a route is "protected" and requires
# that the user be logged in to access the content.
@app.get(
    "/api/secret",
    response_model=SecretResponse,
    dependencies=[Depends(get_auth_user)],
)
async def secret() -> SecretResponse:
    """
    Example protected route.
    Returns a secret message if the user is authenticated.
    """
    # it can be assumed that the user is logged in and has a valid session
    return SecretResponse(secret="info")


@app.get("/{file_path}", response_class=FileResponse)
def get_static_file(file_path: str):
    """
    Serves static files from the 'static' directory.
    If the file does not exist, raises a 404 error.
    """
    if Path("static/" + file_path).is_file():
        return FileResponse("static/" + file_path)
    raise HTTPException(status_code=404, detail="Item not found")
