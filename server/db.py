from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_models import DBBusiness, DBOffer, DBFinancials, DBUser # edited by Jonathan
from pydantic_schemas import OfferOut, BusinessOut, FinancialsOut, UserPublicDetails # edited by Jonathan
# edited by Jonathan
from datetime import datetime, timedelta
from secrets import token_urlsafe
import bcrypt

DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/database"

# edited by Jonathan
SESSION_LIFE_MINUTES = 240

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def get_businesses() -> list[BusinessOut]:
    db = SessionLocal()
    db_businesses = db.query(DBBusiness).order_by(DBBusiness.name).all()
    businesses = []
    for db_business in db_businesses:
        businesses.append(
            BusinessOut(
                id=db_business.id,
                name=db_business.name,
                users_id=db_business.users_id,
                image_url=db_business.image_url,
                address1=db_business.address1,
                address2=db_business.address2,
                city=db_business.city,
                state=db_business.state,
                postal_code=db_business.postal_code,
            )
        )
    db.close()
    return businesses


def get_business(business_id: int) -> BusinessOut | None:
    db = SessionLocal()
    db_business = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()

    if db_business is None:
        return None

    business = BusinessOut(
        id=db_business.id,
        users_id=db_business.users_id,
        name=db_business.name,
        image_url=db_business.image_url,
        address1=db_business.address1,
        address2=db_business.address2,
        city=db_business.city,
        state=db_business.state,
        postal_code=db_business.postal_code,
    )
    db.close()
    return business

def get_offers() -> list[OfferOut]:
    db = SessionLocal()
    db_offers = db.query(DBOffer).order_by(DBOffer.id).all()
    offers = []
    for db_offer in db_offers:
        offers.append(
            OfferOut(
                id=db_offer.id,
                business_id=db_offer.business_id,
                shares_available=db_offer.shares_available,
                price_per_share=db_offer.price_per_share,
                min_investment=db_offer.min_investment,
                start_date=db_offer.start_date,
                expiration_date=db_offer.expiration_date,
                featured=db_offer.featured,
            )
        )
    db.close()
    return offers

def get_offer(offer_id: int) -> OfferOut | None:
    db = SessionLocal()
    db_offer = db.query(DBOffer).filter(DBOffer.id == offer_id).first()

    if db_offer is None:
        return None

    offer = OfferOut(
        id=db_offer.id,
        business_id=db_offer.business_id,
        shares_available=db_offer.shares_available,
        price_per_share=db_offer.price_per_share,
        min_investment=db_offer.min_investment,
        start_date=db_offer.start_date,
        expiration_date=db_offer.expiration_date,
        featured=db_offer.featured,
    )
    db.close()
    return offer

def get_financials_by_business_id(business_id: int) -> list[FinancialsOut]:
    db = SessionLocal()
    db_financials = db.query(DBFinancials).filter(DBFinancials.business_id == business_id).all()

    financials_list = [
        FinancialsOut(
            id=record.id,
            business_id=record.business_id,
            date=record.date,
            amount=record.amount,
            type=record.type,
        )
        for record in db_financials
    ]
    db.close()
    return financials_list


################################################## login-backend by Jonathan

def validate_session(email: str, session_token: str) -> bool:
    """
    Validate a session token for a given email. Returns True if the
    session is valid and not expired, and updates the session expiration.
    Returns False otherwise.
    """

    with SessionLocal() as db:
        account = (
            db.query(DBUser)
            .filter(
                DBUser.email == email,
                DBUser.session_token == session_token,
            )
            .first()
        )
        if not account:
            return False

        # validate that it is not expired
        if datetime.now() >= account.session_expires_at:
            return False

        # update the expiration date and save to the database
        expires = datetime.now() + timedelta(minutes=SESSION_LIFE_MINUTES)
        # assign as datetime, not isoformat
        account.session_expires_at = expires
        db.commit()
        return True

def validate_email_password(email: str, password: str) -> str | None:
    """
    Validate email and password. Returns a new session token if valid,
    None if invalid.
    """
    print(f"🔍 DEBUG: Trying to login with email: {email}")

    with SessionLocal() as db:
        account = db.query(DBUser).filter(DBUser.email == email).first()

        if not account:
            print(f"❌ DEBUG: No account found for email: {email}")
            return None

        print(f"✅ DEBUG: Account found! Name: {account.name}")
        print(f"🔑 DEBUG: Stored hash: {account.hashed_password}")
        print(f"🔑 DEBUG: Input password: {password}")

        # Check password using bcrypt
        password_match = bcrypt.checkpw(password.encode(), account.hashed_password.encode())
        print(f"🔐 DEBUG: Password match result: {password_match}")

        if not password_match:
            print("❌ DEBUG: Password doesn't match!")
            return None

        print("✅ DEBUG: Password matches! Creating session...")

        # Generate new session token and set expiration
        session_token = token_urlsafe()
        expires = datetime.now() + timedelta(minutes=SESSION_LIFE_MINUTES)

        account.session_token = session_token
        account.session_expires_at = expires
        db.commit()

        print(f"🎉 DEBUG: Login successful! Session token: {session_token}")
        return session_token



def invalidate_session(email: str, session_token: str) -> None:
    """
    Invalidate a user's session by setting the session token to a unique
    expired value.
    """
    # retrieve the user account for the given session token
    with SessionLocal() as db:
        account = (
            db.query(DBUser)
            .filter(
                DBUser.email == email,
                DBUser.session_token == session_token,
            )
            .first()
        )
        if not account:
            return

        # set the token to an invalid value that is unique
        account.session_token = f"expired-{token_urlsafe()}"
        db.commit()


def create_user_account(name:str, email: str, password: str) -> bool:
    """
    Create a new user account with the given email and password.
    Returns True if the account was created successfully, or False if the
    username exists.
    """
    # Create a new user account.
    # Returns True if successful, False if email exists.
    with SessionLocal() as db:
        # Check if email already exists
        if db.query(DBUser).filter(DBUser.email == email).first():
            return False
        # Hash the password using bcrypt before storing it in the database.
        # bcrypt.hashpw returns a hashed password as bytes,
        # which we decode to a string.
        hashed_password = bcrypt.hashpw(
            password.encode(), bcrypt.gensalt()
        ).decode()

        account = DBUser()
        account.name = name
        account.email = email
        account.hashed_password = hashed_password
        account.session_token = None
        account.session_expires_at = None

        db.add(account)
        db.commit()
        return True


def get_user_public_details(email: str)-> UserPublicDetails | None:
    """
    Fetch public details for a user by email. Returns a UserPublicDetails
    object if found, or None if not found.
    """

    with SessionLocal() as db:
        account = (
            db.query(DBUser).filter(DBUser.email == email).first()
        )
        if not account:
            return None
        return UserPublicDetails(email=account.email)
