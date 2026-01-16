from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, joinedload
from fastapi import HTTPException
from db_models import (
    DBBusiness,
    DBInvestment,
    DBFinancials,
    DBPurchase,
    PurchaseStatusEnum,
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
    BusinessPatch,
    PurchaseStatus,
)
import os

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/fastcapital",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
SESSION_LIFE_MINUTES = 30


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# AUTH / USERS
# =========================

def validate_email_password(email: str, password: str) -> str | None:
    with SessionLocal() as db:
        account = db.query(DBUser).filter(DBUser.email == email).first()
        if not account:
            return None

        if not bcrypt.checkpw(password.encode(), account.hashed_password.encode()):
            return None

        session_token = token_urlsafe()
        account.session_token = session_token
        account.session_expires_at = datetime.now() + timedelta(minutes=SESSION_LIFE_MINUTES)
        db.commit()
        return session_token


def validate_session(email: str, session_token: str) -> bool:
    with SessionLocal() as db:
        account = (
            db.query(DBUser)
            .filter(DBUser.email == email, DBUser.session_token == session_token)
            .first()
        )
        if not account or not account.session_expires_at:
            return False

        if datetime.now() >= account.session_expires_at:
            return False

        account.session_expires_at = datetime.now() + timedelta(minutes=SESSION_LIFE_MINUTES)
        db.commit()
        return True


def invalidate_session(email: str, session_token: str) -> None:
    with SessionLocal() as db:
        account = (
            db.query(DBUser)
            .filter(DBUser.email == email, DBUser.session_token == session_token)
            .first()
        )
        if account:
            account.session_token = f"expired-{token_urlsafe()}"
            db.commit()


def create_user(name: str, email: str, password: str) -> bool:
    with SessionLocal() as db:
        if db.query(DBUser).filter(DBUser.email == email).first():
            return False

        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        db.add(
            DBUser(
                name=name,
                email=email,
                hashed_password=hashed_password,
                session_token=None,
                session_expires_at=None,
            )
        )
        db.commit()
        return True


def get_user_public_details(email: str) -> UserPublicDetails | None:
    with SessionLocal() as db:
        user = db.query(DBUser).filter(DBUser.email == email).first()
        if not user:
            return None
        return UserPublicDetails(id=user.id, email=user.email)


# =========================
# BUSINESSES
# =========================

def create_business(business: BusinessCreate) -> BusinessOut:
    with SessionLocal() as db:
        db_business = DBBusiness(**business.model_dump())
        db.add(db_business)
        db.commit()
        db.refresh(db_business)
        return BusinessOut.model_validate(db_business)


def update_business_details(
    db: Session,
    business_id: int,
    user_id: int,
    updated_data: BusinessPatch,
) -> BusinessOut:
    business = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in updated_data.model_dump(exclude_unset=True).items():
        setattr(business, field, value)

    db.commit()
    db.refresh(business)
    return BusinessOut.model_validate(business)


def update_business_image(business_id: int, user_id: int, image_url: str) -> str:
    with SessionLocal() as db:
        business = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()
        if not business:
            raise HTTPException(status_code=404, detail="Business not found")
        if business.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        business.image_url = image_url
        db.commit()
        return image_url


def get_businesses() -> list[BusinessOut]:
    with SessionLocal() as db:
        return [BusinessOut.model_validate(b) for b in db.query(DBBusiness).all()]


def get_business(business_id: int) -> BusinessOut | None:
    with SessionLocal() as db:
        b = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()
        return BusinessOut.model_validate(b) if b else None


# =========================
# INVESTMENTS
# =========================

def get_investments() -> list[InvestmentOut]:
    with SessionLocal() as db:
        return [InvestmentOut.model_validate(i) for i in db.query(DBInvestment).all()]


def get_investment(investment_id: int) -> InvestmentOut | None:
    with SessionLocal() as db:
        inv = db.query(DBInvestment).filter(DBInvestment.id == investment_id).first()
        return InvestmentOut.model_validate(inv) if inv else None


def add_investment(new_investment: InvestmentCreate) -> InvestmentOut:
    with SessionLocal() as db:
        if not db.query(DBBusiness).filter(DBBusiness.id == new_investment.business_id).first():
            raise HTTPException(status_code=404, detail="Business not found")

        db_investment = DBInvestment(**new_investment.model_dump())
        db.add(db_investment)
        db.commit()
        db.refresh(db_investment)
        return InvestmentOut.model_validate(db_investment)


# =========================
# PURCHASES
# =========================

def get_purchases_by_status(user_id: int, status: PurchaseStatus) -> list[EnrichedPurchaseOut]:
    with SessionLocal() as db:
        status_enum = PurchaseStatusEnum(status.value)

        results = (
            db.query(DBPurchase, DBBusiness)
            .join(DBInvestment, DBPurchase.investment_id == DBInvestment.id)
            .join(DBBusiness, DBInvestment.business_id == DBBusiness.id)
            .filter(DBPurchase.user_id == user_id, DBPurchase.status == status_enum)
            .order_by(DBPurchase.id)
            .all()
        )

        return [
            EnrichedPurchaseOut(
                id=p.id,
                investment_id=p.investment_id,
                shares_purchased=p.shares_purchased,
                cost_per_share=p.cost_per_share,
                purchase_date=p.purchase_date,
                status=p.status,
                business_name=b.name,
                business_city=b.city,
                business_state=b.state,
                business_image_url=b.image_url,
                business_website_url=b.website_url,
            )
            for p, b in results
        ]


def add_purchase(purchase_request: PurchaseCreate) -> PurchaseOut:
    with SessionLocal() as db:
        investment = (
            db.query(DBInvestment)
            .filter(DBInvestment.id == purchase_request.investment_id)
            .first()
        )
        if not investment:
            raise HTTPException(status_code=404, detail="Investment not found")

        if investment.shares_available < purchase_request.shares_purchased:
            raise HTTPException(status_code=400, detail="Not enough shares available")

        # advance funding
        investment.shares_available -= purchase_request.shares_purchased

        purchase = DBPurchase(
            **purchase_request.model_dump(),
            status=PurchaseStatusEnum.pending,
        )
        db.add(purchase)

        # COMPLETE ALL PURCHASES IF FULLY FUNDED
        if investment.shares_available == 0:
            (
                db.query(DBPurchase)
                .filter(
                    DBPurchase.investment_id == investment.id,
                    DBPurchase.status == PurchaseStatusEnum.pending,
                )
                .update(
                    {DBPurchase.status: PurchaseStatusEnum.completed},
                    synchronize_session=False,
                )
            )

        db.commit()

        # reload purchase after bulk update
        purchase = db.query(DBPurchase).filter(DBPurchase.id == purchase.id).first()
        if not purchase:
            raise HTTPException(status_code=500, detail="Purchase reload failed")

        return PurchaseOut(
            id=purchase.id,
            investment_id=purchase.investment_id,
            user_id=purchase.user_id,
            shares_purchased=purchase.shares_purchased,
            cost_per_share=purchase.cost_per_share,
            purchase_date=purchase.purchase_date,
            status=PurchaseStatus(purchase.status.value),
        )


# =========================
# FINANCIALS
# =========================

def get_financials_by_business_id(business_id: int) -> list[FinancialsOut]:
    with SessionLocal() as db:
        return [
            FinancialsOut.model_validate(f)
            for f in db.query(DBFinancials).filter(DBFinancials.business_id == business_id).all()
        ]


def add_finance(new_finance: FinancialsCreate) -> FinancialsOut:
    with SessionLocal() as db:
        if not db.query(DBBusiness).filter(DBBusiness.id == new_finance.business_id).first():
            raise HTTPException(status_code=404, detail="Business not found")

        finance = DBFinancials(**new_finance.model_dump())
        db.add(finance)
        db.commit()
        db.refresh(finance)
        return FinancialsOut.model_validate(finance)


# =========================
# HELPERS
# =========================

def get_investment_by_id(db: Session, investment_id: int):
    return (
        db.query(DBInvestment)
        .options(joinedload(DBInvestment.business))
        .options(joinedload(DBInvestment.purchases))
        .filter(DBInvestment.id == investment_id)
        .first()
    )
