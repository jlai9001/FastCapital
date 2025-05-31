from fastapi import FastAPI, HTTPException, Query, Request, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
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
)
from pathlib import Path
from typing import List
import db
from db import (
    get_purchases_by_status,
    get_purchases_by_status,
    create_user,
    invalidate_session,
    validate_email_password,
    get_user_public_details,
)
from db_models import PurchaseStatus
from auth import get_auth_user
from rich import print  # debugging


app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost",
    "http://localhost:8000",
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


@app.get("/api/investment")
async def get_investments() -> list[InvestmentOut]:
    return db.get_investments()


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
