from fastapi import FastAPI, HTTPException, Query, Request, Depends, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
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
)
from pathlib import Path
from typing import List
import db
import uuid, os, shutil
from db import (
    get_purchases_by_status,
    create_user,
    create_business,
    invalidate_session,
    validate_email_password,
    get_user_public_details,
    get_db,
)
from db_models import PurchaseStatus, DBUser, DBBusiness, DBInvestment
from auth import get_auth_user
from rich import print  # debugging


app = FastAPI()

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploaded_images", StaticFiles(directory="uploaded_images"), name="uploaded_images")

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
]

app.add_middleware(
    SessionMiddleware,
    secret_key="some-random-string",
    session_cookie="session",
    max_age=60 * 60 * 2,  # 2 hours in seconds
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/investment/{investment_id}")
async def get_investment(investment_id: int) -> InvestmentOut:
    investment = db.get_investment(investment_id)
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    return investment

@app.get("/api/business_investments", response_model=List[InvestmentOut])
async def get_investments_by_business(
    business_id: int = Query(..., description="ID of the business to fetch investments for"),
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_auth_user),
):
    investments = db.query(DBInvestment).filter(DBInvestment.business_id == business_id).all()
    if not investments:
        raise HTTPException(status_code=404, detail="No investments found for this business")
    return investments


@app.get("/api/investment")
async def get_investments() -> list[InvestmentOut]:
    return db.get_investments()

@app.post("/api/business", response_model=BusinessOut, status_code=status.HTTP_201_CREATED)
async def create_business_api(
    name: str = Form(...),
    website_url: str = Form(...),
    image: UploadFile = File(...),
    address1: str = Form(...),
    address2: str = Form(None),
    city: str = Form(...),
    state: str = Form(...),
    postal_code: str = Form(...),
    current_user: DBUser = Depends(get_auth_user),
) -> BusinessOut:
    try:
        # Save image file to local storage
        filename = f"{uuid.uuid4().hex}_{image.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f"http://localhost:8000/uploaded_images/{filename}"

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


@app.get("/api/business/{business_id}")
async def get_business(business_id: int) -> BusinessOut:
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business


@app.get("/api/business")
async def get_businesses() -> list[BusinessOut]:
    return db.get_businesses()


@app.get("/api/purchases", response_model=List[EnrichedPurchaseOut])
async def get_user_purchases(
    status: PurchaseStatus = Query(PurchaseStatus.pending),
    current_user: UserPublicDetails = Depends(get_auth_user),
):
    user_id = current_user.id
    purchases = get_purchases_by_status(user_id, status)
    return purchases


@app.get("/api/financials/{business_id}", response_model=list[FinancialsOut])
def get_financials_for_business(business_id: int):
    financials = db.get_financials_by_business_id(business_id)
    if not financials:
        raise HTTPException(status_code=404, detail="Financials not found for business")
    return financials


@app.post(
    "/api/purchases", status_code=201
)  # status code 201 indicates successful creation
async def post_purchase(purchase_request: PurchaseCreate):
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


# create-financials --Bowe
@app.post("/api/financials/", status_code=201)
async def post_financials(new_finance: FinancialsCreate):
    try:
        finance = db.add_finance(new_finance)
        return finance
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail="Something went wrong on the server."
        )


# create investment endpoint --Bowe
@app.post("/api/investment", status_code=201)
async def post_investment(new_investment: InvestmentCreate):
    try:
        investment = db.add_investment(new_investment)
        return investment
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Server could not post investment.")


###################################################### Login_Backend by Jonathan


@app.post("/api/login", response_model=SuccessResponse)
async def login(credentials: LoginCredentials, request: Request) -> SuccessResponse:
    """
    Handle user login.
    Validates credentials, creates a session, and stores session info
    in cookies. Returns success if login is valid, else raises 401.
    """
    # validate the username and password
    email = credentials.email
    password = credentials.password
    new_session_token = validate_email_password(email, password)

    # return a 401 (unauthorized) if invalid username/password combo
    if not new_session_token:
        raise HTTPException(status_code=401)

    # store the user's username and the generated session_token
    # in the user's session
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
    # invalidate the session in the database
    email = request.session.get("email")
    if not email or not isinstance(email, str):
        return SuccessResponse(success=False)
    session_token = request.session.get("session_token")
    if not session_token or not isinstance(session_token, str):
        return SuccessResponse(success=False)
    invalidate_session(email, session_token)

    # clear out the session data
    request.session.clear()
    return SuccessResponse(success=True)


@app.post("/api/signup", response_model=SuccessResponse)
async def signup(credentials: SignupCredentials, request: Request) -> SuccessResponse:
    name = credentials.name
    email = credentials.email
    password = credentials.password
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    success = create_user(name, email, password)
    if not success:
        raise HTTPException(status_code=409, detail="Email already exists")
    # Automatically log in the user after signup
    new_session_token = validate_email_password(email, password)
    request.session["email"] = email
    request.session["session_token"] = new_session_token
    return SuccessResponse(success=True)


# a "protected" route which should only be reachable by a logged-in user
# example: background metadeta
# ex:  can't navigate to purchase if not logged in
# ex: sending sensitive information (need encryption)
# ex: sending password to server to check credentials
@app.get("/api/me", response_model=UserPublicDetails)
async def get_me(
    current_user: UserPublicDetails = Depends(get_auth_user),
) -> UserPublicDetails:
    try:
        return current_user
    except Exception as e:
        print(f"Error in get_me: {e}")
        raise HTTPException(status_code=401, detail="Unauthorized")

@app.get("/api/my_business", response_model=BusinessOut)
async def get_my_business(
    current_user: DBUser = Depends(get_auth_user),
    db: Session = Depends(get_db),
):
    try:
        business = db.query(DBBusiness).filter(DBBusiness.user_id == current_user.id).first()
    except Exception as e:
        print(f"Error retrieving business: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

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
    if Path("static/" + file_path).is_file():
        return FileResponse("static/" + file_path)
    raise HTTPException(status_code=404, detail="Item not found")
