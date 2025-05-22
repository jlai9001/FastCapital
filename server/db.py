from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_models import DBBusiness, DBOffer, DBPurchase
from pydantic_schemas import OfferOut, BusinessOut, PurchaseCreate, PurchaseOut


DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/fastcapital"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def get_business(business_id: int) -> BusinessOut | None:
    db = SessionLocal()
    db_business = db.query(DBBusiness).filter(DBBusiness.id == business_id).first()

    if db_business is None:
        return None

    business = BusinessOut(
        id=db_business.id,
        user_id=db_business.user_id,
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


def add_purchase(purchase_request: PurchaseCreate) -> PurchaseOut | None:
    with SessionLocal() as db:
        db_purchase = DBPurchase(**purchase_request.dict())
        db.add(db_purchase)
        db.commit()
        db.refresh(db_purchase)
        purchase = PurchaseOut(
            id=db_purchase.id,
            offer_id=db_purchase.id,
            user_id=db_purchase.user,
            shares_purchased=db_purchase.shares_purchased,
            cost_per_share=db_purchase.cost_per_share,
            purchase_date=db_purchase.purchase_date,
            status=db.status,
        )
        return purchase
