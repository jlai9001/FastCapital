from fastapi import FastAPI, HTTPException, Query, Request, Depends
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic_schemas import (
    InvestmentOut,
    BusinessOut,
    FinancialsOut,
    PurchaseCreate,
    EnrichedPurchaseOut,
    LoginCredentials,
    SignupCredentials,
    SuccessResponse,
    SecretResponse,
    UserPublicDetails
)
from pathlib import Path
from typing import List
import db
from db import (
    get_purchases_by_status,
    validate_email_password,
    validate_session,
    invalidate_session,
    create_user_account,
    get_user_public_details
)
from db_models import PurchaseStatus
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
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware for user authentication by Jonathan
app.add_middleware(
    SessionMiddleware, # Tells FastAPI that this feature will run on every request
    secret_key="some-random-string", #Like a password that encrypts user session data
    session_cookie="session", # Names the "memory card" stored in user's browser
    max_age=60*60*2  #Sets how long the "memory" lasts. in this case 2 hours in seconds
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


@app.get("/api/purchases/{user_id}", response_model=List[EnrichedPurchaseOut])
async def get_user_purchases(
    user_id: int,
    status: PurchaseStatus = Query(PurchaseStatus.pending),  # default to 'pending'
):
    purchases = get_purchases_by_status(user_id, status)
    return purchases


@app.get("/api/financials/{business_id}", response_model=list[FinancialsOut])
def get_financials_for_business(business_id: int):
    financials = db.get_financials_by_business_id(business_id)
    if not financials:
        raise HTTPException(status_code=404, detail="Financials not found for business")
    return financials


@app.get("/{file_path}", response_class=FileResponse)
def get_static_file(file_path: str):
    if Path("static/" + file_path).is_file():
        return FileResponse("static/" + file_path)
    raise HTTPException(status_code=404, detail="Item not found")


@app.post("/api/purchases", status_code=201)  # status code 201 indicates success
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


###################################################### Login_Backend by Jonathan

# accepts a email and password and create a new login-session
# if the email and password are valid
@app.post("/api/login", response_model=SuccessResponse)
async def session_login(
    credentials: LoginCredentials, request: Request
) -> SuccessResponse:
    """
    Handle user login.
    Validates credentials, creates a session, and stores session info
    in cookies. Returns success if login is valid, else raises 401.
    """
    # validate the email and password
    email = credentials.email
    password = credentials.password
    new_session_token = validate_email_password(email, password)

    # return a 401 (unauthorized) if invalid email/password combo
    if not new_session_token:
        raise HTTPException(status_code=401)

    # store the user's email and the generated session_token
    # in the user's session
    request.session["email"] = email
    request.session["session_token"] = new_session_token
    return SuccessResponse(success=True)




# invalidate the user's session in the database
# and delete the session cookie from the user's browser

@app.get("/api/logout", response_model=SuccessResponse)
async def session_logout(request: Request) -> SuccessResponse:
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


# accepts a email and password and create a new user in the database
# if the user doesn't already exist. It also logs the user in.
@app.post("/api/signup", response_model=SuccessResponse)
async def signup(
    credentials: SignupCredentials, request: Request
) -> SuccessResponse:
    """
    Handle user signup.
    Creates a new user account if email is available, then logs in
    the user. Returns success if signup is successful, else raises 400
    or 409.
    """
    name = credentials.name
    email = credentials.email
    password = credentials.password
    # Check for empty email or password
    if not email or not password:
        raise HTTPException(
            status_code=400, detail="Email and password required"
        )
    # Use db.py helper to create the user account
    success = create_user_account(name, email, password)
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

# This is an authentication function which can be Depend'd
# on by a route to require authentication for access to the route.
# See the next route below (@app.get("/", ...)) for an example.
def get_auth_user(request: Request):
    """
    Dependency for protected routes.
    Verifies that the user has a valid session. Raises 401 if not
    authenticated, 403 if session is invalid. Returns True if
    authenticated.
    """
    """verify that user has a valid session"""
    username = request.session.get("email")
    if not username or not isinstance(username, str):
        raise HTTPException(status_code=401)
    session_token = request.session.get("session_token")
    if not session_token or not isinstance(session_token, str):
        raise HTTPException(status_code=401)
    if not validate_session(username, session_token):
        raise HTTPException(status_code=403)
    return True


# a "protected" route which returns the details of the currently logged-in user.
# example: return user details to store in cookie to use as context in REACT
# ex: Welcome <name> !
@app.get(
    "/api/me",
    response_model=UserPublicDetails,
    dependencies=[Depends(get_auth_user)],
)
async def get_me(request: Request) -> UserPublicDetails:
    """
    Returns the public details of the currently authenticated user.
    Raises 404 if the user is not found in the database.
    """
    email = request.session.get("email")
    if not isinstance(email, str):
        raise HTTPException(status_code=404, detail="User not found")
    user_details = get_user_public_details(email)
    if not user_details:
        raise HTTPException(status_code=404, detail="User not found")
    return user_details


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



#################################################
