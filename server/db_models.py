from sqlalchemy import (
    ForeignKey,
    Date,
    DateTime,
    Boolean,
    Enum,
)
from sqlalchemy.orm import declarative_base, mapped_column, Mapped, relationship
from typing import List, Optional
from datetime import datetime as DateTimeType
from datetime import date as DateType
from enums import FinancialType
import enum

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
    session_token: Mapped[str | None] = mapped_column(nullable=True)
    session_expires_at: Mapped[DateTimeType | None] = mapped_column(
        DateTime, nullable=True
    )
    # ✅ relationships
    businesses: Mapped[List["DBBusiness"]] = relationship(back_populates="user")
    purchases: Mapped[List["DBPurchase"]] = relationship(back_populates="user")


class DBBusiness(Base):
    __tablename__ = "businesses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    image_url: Mapped[str | None] = mapped_column(nullable=True)
    website_url: Mapped[str | None] = mapped_column(nullable=True)
    address1: Mapped[str | None] = mapped_column(nullable=True)
    address2: Mapped[str | None] = mapped_column(nullable=True)
    city: Mapped[str | None] = mapped_column(nullable=True)
    state: Mapped[str | None] = mapped_column(nullable=True)
    postal_code: Mapped[str | None] = mapped_column(nullable=True)

    # ✅ relationships
    user: Mapped["DBUser"] = relationship(back_populates="businesses")
    investments: Mapped[List["DBInvestment"]] = relationship(back_populates="business")
    financials: Mapped[List["DBFinancials"]] = relationship(back_populates="business")


class DBInvestment(Base):
    __tablename__ = "investments"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"))
    shares_available: Mapped[int] = mapped_column(nullable=False)
    price_per_share: Mapped[float] = mapped_column(nullable=False)
    min_investment: Mapped[int] = mapped_column(nullable=False)
    start_date: Mapped[DateTimeType] = mapped_column(DateTime, nullable=False)
    expiration_date: Mapped[DateTimeType] = mapped_column(DateTime, nullable=False)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)

    # ✅ relationships (THIS is what your API needs)
    business: Mapped["DBBusiness"] = relationship(back_populates="investments")
    purchases: Mapped[List["DBPurchase"]] = relationship(back_populates="investment")


class DBPurchase(Base):
    __tablename__ = "purchases"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    investment_id: Mapped[int] = mapped_column(ForeignKey("investments.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    shares_purchased: Mapped[int] = mapped_column(nullable=False)
    cost_per_share: Mapped[float] = mapped_column(nullable=False)
    purchase_date: Mapped[DateTimeType] = mapped_column(
        DateTime, nullable=False
    )
    status: Mapped[PurchaseStatusEnum] = mapped_column(
        Enum(PurchaseStatusEnum),
        default=PurchaseStatusEnum.pending,
        nullable=False,
    )

    # ✅ relationships
    investment: Mapped["DBInvestment"] = relationship(back_populates="purchases")
    user: Mapped["DBUser"] = relationship(back_populates="purchases")


class DBFinancials(Base):
    __tablename__ = "financials"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id"))
    date: Mapped[DateType] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(nullable=False)
    type: Mapped[FinancialType] = mapped_column(
        Enum(FinancialType),
        nullable=False,
    )
    # ✅ relationship
    business: Mapped["DBBusiness"] = relationship(back_populates="financials")
