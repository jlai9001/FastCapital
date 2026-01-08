from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_models import (
    Base,
    DBUser,
    DBBusiness,
    DBFinancials,
    DBInvestment,
    DBPurchase,
    PurchaseStatusEnum,
)
from enums import FinancialType
import os
from datetime import date

# -------------------------------------------------
# DATABASE CONNECTION
# -------------------------------------------------

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/fastcapital",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


# -------------------------------------------------
# SEED FUNCTIONS
# -------------------------------------------------

def seed_users(db):
    if db.query(DBUser).first():
        print("Users already exist — skipping")
        return

    users = [
        DBUser(
            name="John Smith",
            email="jsmith@email.com",
            hashed_password="$2b$12$B.u84R0iEfuKtPFW2r13DOhAu6iHKm2erZD0icf8NjYCIVDW0L.RW",
        ),
        DBUser(
            name="Jane Doe",
            email="jdoe@email.com",
            hashed_password="$2b$12$APvM26Vbbc8fvxFfrIGAKudul24SGcuA7znlfTxrUcr8rW9zk7WF2",
        ),
        DBUser(
            name="Alice Johnson",
            email="alicej@email.com",
            hashed_password="$2b$12$IWnYtBj9p2wzpR9A8cn5Sets.dh9zBCbe.GSMRUydmURrodxt/UIq",
        ),
    ]

    db.add_all(users)
    db.commit()
    print("Seeded users")


def seed_businesses(db):
    if db.query(DBBusiness).first():
        print("Businesses already exist — skipping")
        return

    businesses = [
        DBBusiness(
            name="Best Burgers",
            user_id=1,
            image_url="./uploaded_images/image.jpg",
            website_url="http://www.hackreactor.com",
            address1="123 Main St",
            address2="Apt 4B",
            city="Los Angeles",
            state="CA",
            postal_code="90001",
        ),
        DBBusiness(
            name="Tech Innovations",
            user_id=2,
            image_url="./uploaded_images/image.jpg",
            website_url="http://www.hackreactor.com",
            address1="456 Market St",
            city="San Francisco",
            state="CA",
            postal_code="94105",
        ),
        DBBusiness(
            name="Green Grocer",
            user_id=3,
            image_url="./uploaded_images/image.jpg",
            website_url="http://www.hackreactor.com",
            address1="789 Broadway",
            city="New York",
            state="NY",
            postal_code="10001",
        ),
    ]

    db.add_all(businesses)
    db.commit()
    print("Seeded businesses")


def seed_financials(db):
    if db.query(DBFinancials).first():
        print("Financials already exist — skipping")
        return

    financials = [
        DBFinancials(
            business_id=1,
            date=date(2023, 1, 1),
            amount=50000,
            type=FinancialType.income,
        ),
        DBFinancials(
            business_id=1,
            date=date(2023, 1, 1),
            amount=20000,
            type=FinancialType.expense,
        ),
        DBFinancials(
            business_id=1,
            date=date(2023, 1, 1),
            amount=60000,
            type=FinancialType.asset,
        ),
        DBFinancials(
            business_id=1,
            date=date(2023, 1, 1),
            amount=20000,
            type=FinancialType.liability,
        ),
    ]

    db.add_all(financials)
    db.commit()
    print("Seeded financials")


def seed_investments(db):
    if db.query(DBInvestment).first():
        print("Investments already exist — skipping")
        return

    investments = [
        DBInvestment(
            business_id=1,
            shares_available=500,
            price_per_share=10.00,
            min_investment=100,
            start_date=date(2023, 3, 1),
            expiration_date=date(2023, 6, 1),
            featured=True,
        ),
        DBInvestment(
            business_id=2,
            shares_available=1000,
            price_per_share=20.00,
            min_investment=100,
            start_date=date(2023, 3, 15),
            expiration_date=date(2023, 9, 15),
            featured=False,
        ),
    ]

    db.add_all(investments)
    db.commit()
    print("Seeded investments")


def seed_purchases(db):
    if db.query(DBPurchase).first():
        print("Purchases already exist — skipping")
        return

    purchases = [
        DBPurchase(
            investment_id=1,
            user_id=1,
            shares_purchased=100,
            cost_per_share=10.00,
            purchase_date=date(2023, 3, 2),
            status=PurchaseStatusEnum.completed,
        ),
        DBPurchase(
            investment_id=2,
            user_id=2,
            shares_purchased=100,
            cost_per_share=20.00,
            purchase_date=date(2023, 3, 16),
            status=PurchaseStatusEnum.pending,
        ),
    ]

    db.add_all(purchases)
    db.commit()
    print("Seeded purchases")


# -------------------------------------------------
# MAIN ENTRY
# -------------------------------------------------

def run_seed():
    print("Starting database seed...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_users(db)
        seed_businesses(db)
        seed_financials(db)
        seed_investments(db)
        seed_purchases(db)
    finally:
        db.close()

    print("Seeding complete")


if __name__ == "__main__":
    run_seed()
