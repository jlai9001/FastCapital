from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
import enum


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserOut(UserCreate):
    id: int
    name: str
    email: str


class BusinessCreate(BaseModel):
    name: str
    users_id: int
    image_url: str
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    postal_code: str


class BusinessOut(BusinessCreate):
    id: int


class OfferCreate(BaseModel):
    business_id: int
    shares_available: int
    price_per_share: float
    min_investment: int
    start_date: date
    expiration_date: date


class OfferOut(OfferCreate):
    id: int


class PurchaseCreate(BaseModel):
    offer_id: int
    users_id: int
    shares_purchased: int
    cost_per_share: float
    purchase_date: datetime


class PurchaseStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    expired = "expired"


class PurchaseOut(PurchaseCreate):
    id: int


class FinancialType(str, enum.Enum):
    income = "income"
    expense = "expense"
    asset = "asset"
    liability = "liability"


class FinancialsCreate(BaseModel):
    business_id: int
    date: date
    amount: float
    type: FinancialType


class FinancialsOut(FinancialsCreate):
    id: int
