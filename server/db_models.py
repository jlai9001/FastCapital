from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()


class DBUser(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


class DBBusiness(Base):
    __tablename__ = "business"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"))
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
    prince_per_share = Column(Float)
    min_investment = Column(Integer)
    start_date = Column(datetime)
    expiration_date = Column(datetime)
    featured = Column(bool, default=0)


class DBPurchase(Base):
    __tablename__ = "purchase"
    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offer.id"))
    user_id = Column(Integer, ForeignKey("user.id"))
    shares_purchased = Column(Integer)
    cost_per_share = Column(Float)
    purchase_date = Column(datetime)
    status = Column(String, default="pending")  # pending, completed, cancelled


class DBFinancials(Base):
    __tablename__ = "financials"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("business.id"))
    date = Column(datetime)
    amount = Column(Float)
    type = Column(String)  # revenue, expense, asset, liability
