from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_models import DBBusiness, DBOffer
from pydantic_schemas import OfferOut, BusinessOut


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
