from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Boolean,
    Enum,
)
from sqlalchemy.orm import declarative_base
import datetime
import enum

Base = declarative_base()


class PurchaseStatusEnum(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    expired = "expired"


class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    # added login session information by Jonathan
    # note replace hashed password with regular password
    session_token = Column(String, nullable=True)
    session_expires_at = Column(DateTime, nullable=True)

class DBBusiness(Base):
    __tablename__ = "businesses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_url = Column(String)
    website_url = Column(String)
    address1 = Column(String)
    address2 = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)


class DBInvestment(Base):
    __tablename__ = "investments"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    shares_available = Column(Integer)
    price_per_share = Column(Float)
    min_investment = Column(Integer)
    start_date = Column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    expiration_date = Column(
        DateTime, default=datetime.datetime.now(datetime.timezone.utc)
    )
    featured = Column(Boolean, default=False)


class PurchaseStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    expired = "expired"


class DBPurchase(Base):
    __tablename__ = "purchases"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    investment_id = Column(Integer, ForeignKey("investments.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    shares_purchased = Column(Integer)
    cost_per_share = Column(Float)
    purchase_date = Column(
        DateTime, default=datetime.datetime.now(datetime.timezone.utc)
    )
    status = Column(
        Enum(PurchaseStatusEnum, name="purchase_status", create_type=False),
        default=PurchaseStatusEnum.pending,
        nullable=False,
    )


class DBFinancials(Base):
    __tablename__ = "financials"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    date = Column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    amount = Column(Float)
    type = Column(
        Enum()
    )  # revenue, expense, asset, liability
