from sqlalchemy import Enum, Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import declarative_base
import datetime
from pydantic_schemas import PurchaseStatus

Base = declarative_base()


class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


class DBBusiness(Base):
    __tablename__ = "business"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    users_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String)
    address1 = Column(String)
    address2 = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)


class DBOffer(Base):
    __tablename__ = "offer"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business.id"))
    shares_available = Column(Integer)
    price_per_share = Column(Float)
    min_investment = Column(Integer)
    start_date = Column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    expiration_date = Column(
        DateTime, default=datetime.datetime.now(datetime.timezone.utc)
    )
    featured = Column(Boolean, default=False)


class DBPurchase(Base):
    __tablename__ = "purchase"
    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offer.id"))
    users_id = Column(Integer, ForeignKey("users.id"))
    shares_purchased = Column(Integer)
    cost_per_share = Column(Float)
    purchase_date = Column(
        DateTime, default=datetime.datetime.now(datetime.timezone.utc)
    )
    status = Column(
        Enum(PurchaseStatus, name="purchase_status"),
        default=PurchaseStatus.pending,
        nullable=False
        )  # pending, completed, cancelled


class DBFinancials(Base):
    __tablename__ = "financials"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business.id"))
    date = Column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    amount = Column(Float)
    type = Column(String)  # revenue, expense, asset, liability
