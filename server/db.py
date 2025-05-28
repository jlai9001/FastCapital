from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_models import DBBusiness, DBInvestment, DBFinancials, DBPurchase, PurchaseStatus, DBUser
from pydantic_schemas import (
    InvestmentOut,
    BusinessOut,
    FinancialsOut,
    PurchaseCreate,
    PurchaseOut,
    EnrichedPurchaseOut,
    PurchaseStatus,
    UserPublicDetails
)
import bcrypt

DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/fastcapital"

# edited by Jonathan
SESSION_LIFE_MINUTES = 240

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def get_businesses() -> list[BusinessOut]:
    with SessionLocal() as db:
        db_businesses = db.query(DBBusiness).order_by(DBBusiness.name).all()
        businesses = []
        for db_business in db_businesses:
            businesses.append(
                BusinessOut(
                    id=db_business.id,
                    name=db_business.name,
                    users_id=db_business.user_id,
                    image_url=db_business.image_url,
                    website_url=db_business.website_url,
                    address1=db_business.address1,
                    address2=db_business.address2,
                    city=db_business.city,
                    state=db_business.state,
                    postal_code=db_business.postal_code,
                )
            )
        return businesses


def get_business(business_id: int) -> BusinessOut | None:
    with SessionLocal() as db:
        db_business = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()
        if db_business is None:
            return None
        return BusinessOut(
            id=db_business.id,
            users_id=db_business.user_id,
            name=db_business.name,
            image_url=db_business.image_url,
            website_url=db_business.website_url,
            address1=db_business.address1,
            address2=db_business.address2,
            city=db_business.city,
            state=db_business.state,
            postal_code=db_business.postal_code,
        )


def get_investments() -> list[InvestmentOut]:
    with SessionLocal() as db:
        db_investments = db.query(DBInvestment).order_by(DBInvestment.id).all()
        investments = []
        for db_investment in db_investments:
            investments.append(
                InvestmentOut(
                    id=db_investment.id,
                    business_id=db_investment.business_id,
                    shares_available=db_investment.shares_available,
                    price_per_share=db_investment.price_per_share,
                    min_investment=db_investment.min_investment,
                    start_date=db_investment.start_date,
                    expiration_date=db_investment.expiration_date,
                    featured=db_investment.featured,
                )
            )
        return investments


def get_investment(investment_id: int) -> InvestmentOut | None:
    with SessionLocal() as db:
        db_investment = db.query(DBInvestment).filter(DBInvestment.id == investment_id).first()
        if db_investment is None:
            return None
        return InvestmentOut(
            id=db_investment.id,
            business_id=db_investment.business_id,
            shares_available=db_investment.shares_available,
            price_per_share=db_investment.price_per_share,
            min_investment=db_investment.min_investment,
            start_date=db_investment.start_date,
            expiration_date=db_investment.expiration_date,
            featured=db_investment.featured,
        )


def get_purchases_by_status(user_id: int, status: PurchaseStatus) -> list[EnrichedPurchaseOut]:
    with SessionLocal() as db:
        results = (
            db.query(DBPurchase, DBBusiness)
            .join(DBInvestment, DBPurchase.investment_id == DBInvestment.id)
            .join(DBBusiness, DBInvestment.business_id == DBBusiness.id)
            .filter(
                DBPurchase.user_id == user_id,
                DBPurchase.status == status
            )
            .order_by(DBPurchase.id)
            .all()
        )

        enriched_purchases = [
            EnrichedPurchaseOut(
                id=db_purchase.id,
                investment_id=db_purchase.investment_id,
                shares_purchased=db_purchase.shares_purchased,
                cost_per_share=db_purchase.cost_per_share,
                purchase_date=db_purchase.purchase_date,
                status=db_purchase.status,
                business_name=db_business.name,
                business_city=db_business.city,
                business_state=db_business.state,
                business_image_url=db_business.image_url,
                business_website_url=db_business.website_url,
            )
            for db_purchase, db_business in results
        ]
        return enriched_purchases


def get_financials_by_business_id(business_id: int) -> list[FinancialsOut]:
    with SessionLocal() as db:
        db_financial_records = (
            db.query(DBFinancials).filter(DBFinancials.business_id == business_id).all()
        )

        financials = [
            FinancialsOut(
                id=record.id,
                business_id=record.business_id,
                date=record.date,
                amount=record.amount,
                type=record.type,
            )
            for db_financial in db_financial_records
        ]
        return financials

def add_purchase(purchase_request: PurchaseCreate) -> PurchaseOut | None:
    with SessionLocal() as db:
        db_investment = (
            db.query(DBInvestment).filter(DBInvestment.id == purchase_request.investment_id).first()
        )
        if not db_investment:
            raise ValueError("Investment not found")
        if db_investment.shares_available < purchase_request.shares_purchased:
            raise Exception("NotEnoughSharesException")

        # Deduct shares
        db_investment.shares_available -= purchase_request.shares_purchased
        db_purchase = DBPurchase(
            **purchase_request.dict(), status=PurchaseStatus.pending
        )
        db.add(db_purchase)
        db.commit()
        db.refresh(db_purchase)

        return PurchaseOut(
            id=db_purchase.id,
            investment_id=db_purchase.investment_id,
            user_id=db_purchase.user_id,
            shares_purchased=db_purchase.shares_purchased,
            cost_per_share=db_purchase.cost_per_share,
            purchase_date=db_purchase.purchase_date,
            status=db_purchase.status.value,
        )




################################################## login-backend by Jonathan

def validate_session(email: str, session_token: str) -> bool:
    """
    Validate a session token for a given email. Returns True if the
    session is valid and not expired, and updates the session expiration.
    Returns False otherwise.
    """

    with SessionLocal() as db:
        # find the account in the DATABASEEEEEEEEE (no session related stuff)
        account = (
            db.query(DBUser)
            .filter(
                # find what user is using this through email only
                DBUser.email == email,
            )
            .first()
        )
        if not account: # if account does not exist
            return False

        # assign account session token with session token
        account.session_token=session_token


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
