from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional
import enum


class LoginCredentials(BaseModel):
    email: EmailStr
    password: str


class SuccessResponse(BaseModel):
    success: bool
    message: str | None = None


class SecretResponse(BaseModel):
    secret: str


class UserPublicDetails(BaseModel):
    email: str
    id: int
    # Add more public fields here if needed

class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserOut(UserCreate):
    id: int


class BusinessCreate(BaseModel):
    name: str
    users_id: int
    website_url: str
    image_url: str
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    postal_code: str


class BusinessOut(BusinessCreate):
    id: int


class InvestmentCreate(BaseModel):
    business_id: int
    shares_available: int
    price_per_share: float
    min_investment: int
    start_date: date
    expiration_date: date


class InvestmentOut(InvestmentCreate):
    id: int
    featured: bool


class PurchaseCreate(BaseModel):
    investment_id: int
    user_id: int
    shares_purchased: int
    cost_per_share: float
    purchase_date: datetime


class PurchaseStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    expired = "expired"


class PurchaseOut(PurchaseCreate):
    id: int
    status: PurchaseStatus


class EnrichedPurchaseOut(BaseModel):
    id: int
    investment_id: int
    shares_purchased: int
    cost_per_share: float
    purchase_date: datetime
    status: PurchaseStatus
    business_name: str
    business_city: str
    business_state: str
    business_image_url: str
    business_website_url: str


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
