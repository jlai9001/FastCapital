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
from sqlalchemy.orm import declarative_base, mapped_column, Mapped, relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from pydantic_schemas import FinancialType

Base = declarative_base()


class PurchaseStatusEnum(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    expired = "expired"


class DBUser(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)
    session_token: Mapped[str] = mapped_column(nullable=True)
    session_expires_at: Mapped[datetime] = mapped_column(nullable=True)


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
    start_date = Column(DateTime(timezone=True), default=func.now())
    expiration_date = Column(DateTime(timezone=True), default=func.now())
    featured = Column(Boolean, default=False)

    purchases = relationship("DBPurchase", back_populates="investment")


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
    purchase_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(
        Enum(PurchaseStatusEnum, name="purchase_status", create_type=False),
        default=PurchaseStatusEnum.pending,
        nullable=False,
    )
    investment = relationship("DBInvestment", back_populates="purchases")


class DBFinancials(Base):
    __tablename__ = "financials"
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(Integer, ForeignKey("businesses.id"))
    date = Column(DateTime(timezone=True), server_default=func.now())
    amount = Column(Float)
    type = Column(Enum(FinancialType), nullable=False)
