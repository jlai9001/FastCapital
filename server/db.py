from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import HTTPException, status
from db_models import (
    DBBusiness,
    DBInvestment,
    DBFinancials,
    DBPurchase,
    PurchaseStatus,
    DBUser,
)
import bcrypt
from secrets import token_urlsafe
from datetime import datetime, timedelta
from pydantic_schemas import (
    InvestmentCreate,
    InvestmentOut,
    BusinessOut,
    FinancialsOut,
    FinancialsCreate,
    PurchaseCreate,
    PurchaseOut,
    EnrichedPurchaseOut,
    UserPublicDetails,
    BusinessCreate,
    BusinessUpdate
)
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/fastcapital")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
SESSION_LIFE_MINUTES = 30


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def validate_email_password(email: str, password: str) -> str | None:
    """
    Validate an email and password against the database. If valid,
    generates a new session token, updates the session expiration, and
    returns the session token. Returns None if credentials are invalid.
    """
    with SessionLocal() as db:
        account = db.query(DBUser).filter(DBUser.email == email).first()
        if not account:
            return None

        valid_credentials = bcrypt.checkpw(
            password.encode(), account.hashed_password.encode()
        )
        if not valid_credentials:
            return None

        session_token = token_urlsafe()
        account.session_token = session_token
        expires = datetime.now() + timedelta(minutes=SESSION_LIFE_MINUTES)
        account.session_expires_at = expires
        db.commit()
        return session_token


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

        if datetime.now() >= account.session_expires_at:
            return False

        expires = datetime.now() + timedelta(minutes=SESSION_LIFE_MINUTES)
        account.session_expires_at = expires
        db.commit()
        return True


def invalidate_session(email: str, session_token: str) -> None:
    """
    Invalidate a user's session by setting the session token to a unique
    expired value.
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
            return

        account.session_token = f"expired-{token_urlsafe()}"
        db.commit()


def create_user(name: str, email: str, password: str) -> bool:
    """
    Creates a new user account with the given name,
    email, and password. Returns True if the account was created successfully,
    """
    with SessionLocal() as db:
        if db.query(DBUser).filter(DBUser.email == email).first():
            return False
        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        account = DBUser(
            name=name,
            email=email,
            hashed_password=hashed_password,
            session_token=None,
            session_expires_at=None,
        )
        db.add(account)
        db.commit()
        return True


def get_user_public_details(email: str):
    """
    Retrieve public details of a user by email. Returns a UserPublicDetails object
    containing the user's ID and email, or None if the user does not exist.
    """
    with SessionLocal() as db:
        account = db.query(DBUser).filter(DBUser.email == email).first()
        if not account:
            return None
        return UserPublicDetails(id=account.id, email=account.email)


def create_business(business: BusinessCreate) -> BusinessOut:
    """
    Create a new business entry in the database. The business will be associated with logged in user.
    Returns a BusinessOut object containing the created business details.
    """
    with SessionLocal() as db:
        db_business = DBBusiness(**business.dict())
        db.add(db_business)
        db.commit()
        db.refresh(db_business)
        print(vars(db_business))
        return BusinessOut(
            id=db_business.id,
            name=db_business.name,
            user_id=db_business.user_id,
            website_url=db_business.website_url,
            image_url=db_business.image_url,
            address1=db_business.address1,
            address2=db_business.address2,
            city=db_business.city,
            state=db_business.state,
            postal_code=db_business.postal_code,
        )

def update_business_details(
    db: Session,
    business_id: int,
    user_id: int,
    updated_data: BusinessUpdate,
) -> DBBusiness:
    """
    Update the details of an existing business. Ensures the user is authorized to make the update.
    Raises HTTPException if the business does not exist or the user is not authorized.
    """
    business = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()

    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    if business.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this business")

    for field, value in updated_data.dict(exclude_unset=True).items():
        setattr(business, field, value)

    db.commit()
    db.refresh(business)
    return business


def update_business_image(business_id: int, user_id: int, image_url: str) -> str:
    """
    Update the image URL for a business on the Business Profile Page. Ensures the user is authorized to make the update.
    """
    with SessionLocal() as db:
        db_business = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()

        if not db_business:
            raise ValueError("Business not found")

        if db_business.user_id != user_id:
            raise PermissionError("User not authorized to update this business")

        db_business.image_url = image_url
        db.commit()
        return image_url


def get_businesses() -> list[BusinessOut]:
    """
    Retrieve all businesses from the database, ordered by name.
    Returns a list of BusinessOut objects containing business details.
    """
    with SessionLocal() as db:
        db_businesses = db.query(DBBusiness).order_by(DBBusiness.name).all()
        businesses = []
        for db_business in db_businesses:
            businesses.append(
                BusinessOut(
                    id=db_business.id,
                    name=db_business.name,
                    user_id=db_business.user_id,
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
    """
    Retrieve a specific business by its ID. Returns a BusinessOut object containing the business details,
    or None if the business does not exist.
    """
    with SessionLocal() as db:
        db_business = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()
        if db_business is None:
            return None
        return BusinessOut(
            id=db_business.id,
            user_id=db_business.user_id,
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
    """
    Retrieve all investments from the database, ordered by ID.
    Returns a list of InvestmentOut objects containing investment details.
    """
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
    """
    Retrieve a specific investment by its ID. Returns an InvestmentOut object containing the investment details,
    or None if the investment does not exist.
    """
    with SessionLocal() as db:
        db_investment = (
            db.query(DBInvestment).filter(DBInvestment.id == investment_id).first()
        )
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


def get_purchases_by_status(user_id: int, status: PurchaseStatus
    ) -> list[EnrichedPurchaseOut]:
    """
    Retrieve all purchases made by a user with a specific status.
    Returns a list of EnrichedPurchaseOut objects containing purchase details,
    enriched with business information.
    """
    with SessionLocal() as db:
        results = (
            db.query(DBPurchase, DBBusiness)
            .join(DBInvestment, DBPurchase.investment_id == DBInvestment.id)
            .join(DBBusiness, DBInvestment.business_id == DBBusiness.id)
            .filter(DBPurchase.user_id == user_id, DBPurchase.status == status)
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
    """
    Retrieve all financial records for a specific business by its ID.
    Returns a list of FinancialsOut objects containing financial details.
    """
    with SessionLocal() as db:
        db_financial_records = (
            db.query(DBFinancials).filter(DBFinancials.business_id == business_id).all()
        )

        financials = [
            FinancialsOut(
                id=db_financial.id,
                business_id=db_financial.business_id,
                date=db_financial.date,
                amount=db_financial.amount,
                type=db_financial.type,
            )
            for db_financial in db_financial_records
        ]
        return financials


def add_finance(new_finance: FinancialsCreate) -> FinancialsOut:
    """
    Add a new financial record for a business. The business must exist in the database.
    Returns a FinancialsOut object containing the created financial record details.
    """
    with SessionLocal() as db:
        db_business = (
            db.query(DBBusiness)
            .filter(DBBusiness.id == new_finance.business_id)
            .first()
        )
        if not db_business:
            raise ValueError("Business not found")
        # transcribe new_finance to db_finance
        db_financial = DBFinancials(**new_finance.dict())
        db.add(db_financial)
        db.commit()
        db.refresh(db_financial)
        # add, commit, refresh, return
        finance = FinancialsOut(
            id=db_financial.id,
            business_id=db_financial.business_id,
            date=db_financial.date,
            amount=db_financial.amount,
            type=db_financial.type,
        )
        return finance


def add_purchase(purchase_request: PurchaseCreate) -> PurchaseOut | None:
    """
    Add a new purchase to the database. The purchase must be valid and the investment must have enough shares available.
    Returns a PurchaseOut object containing the created purchase details.
    Raises an exception if the investment does not have enough shares available.
    """
    with SessionLocal() as db:
        db_investment = (
            db.query(DBInvestment)
            .filter(DBInvestment.id == purchase_request.investment_id)
            .first()
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


def add_investment(new_investment: InvestmentCreate) -> InvestmentOut:
    """
    Add a new investment to the database. The investment must be associated with an existing business.
    Returns an InvestmentOut object containing the created investment details.
    Raises a ValueError if the business does not exist.
    """
    with SessionLocal() as db:
        # query by buisness id, return error if not found
        db_business = (
            db.query(DBBusiness)
            .filter(DBBusiness.id == new_investment.business_id)
            .first()
        )
        if not db_business:
            raise ValueError("Business not found.")
        # transcribe pydantic to db model
        db_investment = DBInvestment(**new_investment.dict())
        db.add(db_investment)
        db.commit()
        db.refresh(db_investment)
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
