from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_models import DBBusiness, DBOffer, DBFinancials, DBPurchase
from pydantic_schemas import (
    OfferOut,
    BusinessOut,
    FinancialsOut,
    PurchaseCreate,
    PurchaseOut,
    EnrichedPurchaseOut,
    PurchaseStatus
)


DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/fastcapital"

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
    with SessionLocal() as db:
        db_business = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()
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


def get_purchases_by_status(users_id: int, status: PurchaseStatus) -> list[EnrichedPurchaseOut]:
    db = SessionLocal()
    try:
        results = (
            db.query(DBPurchase, DBBusiness)
            .join(DBOffer, DBPurchase.offer_id == DBOffer.id)
            .join(DBBusiness, DBOffer.business_id == DBBusiness.id)
            .filter(
                DBPurchase.users_id == users_id,
                DBPurchase.status == status
            )
            .order_by(DBPurchase.id)
            .all()
        )

        return [
            EnrichedPurchaseOut(
                id=purchase.id,
                offer_id=purchase.offer_id,
                shares_purchased=purchase.shares_purchased,
                cost_per_share=purchase.cost_per_share,
                purchase_date=purchase.purchase_date,
                status=purchase.status,
                business_name=business.name,
                business_city=business.city,
                business_state=business.state
            )
            for purchase, business in results
        ]
    finally:
        db.close()


def get_financials_by_business_id(business_id: int) -> list[FinancialsOut]:
    db = SessionLocal()
    db_financials = (
        db.query(DBFinancials).filter(DBFinancials.business_id == business_id).all()
    )

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


def add_purchase(purchase_request: PurchaseCreate) -> PurchaseOut | None:
    with SessionLocal() as db:
        db_purchase = DBPurchase(**purchase_request.dict())
        print(db_purchase)
        db.add(db_purchase)
        db.commit()
        db.refresh(db_purchase)
        purchase = PurchaseOut(
            id=db_purchase.id,
            offer_id=db_purchase.offer_id,
            users_id=db_purchase.users_id,
            shares_purchased=db_purchase.shares_purchased,
            cost_per_share=db_purchase.cost_per_share,
            purchase_date=db_purchase.purchase_date,
            status=db_purchase.status.value,  # DB status is an enum object, so this should return one of three values?
        )
        print(purchase)
        return purchase
