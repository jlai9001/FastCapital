import enum

class PurchaseStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    expired = "expired"

from enums import FinancialType
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator, Field
from datetime import date, datetime
from typing import Optional, List
import re  # this helps the Bowe validate date format


class LoginCredentials(BaseModel):
    email: EmailStr
    password: str


class SignupCredentials(BaseModel):
    name: str
    email: EmailStr
    password: str

# JWT - SESSION LOGIC

class SuccessResponse(BaseModel):
    success: bool
    message: str | None = None


class LoginResponse(SuccessResponse):
    # JWT fallback for iOS Safari (or any client that can't store cookies)
    access_token: str | None = None
    token_type: str | None = "bearer"


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
    user_id: int
    website_url: str
    image_url: Optional[str] = None
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    postal_code: str


class BusinessOut(BusinessCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    website_url: Optional[str] = None
    image_url: Optional[str] = None
    address1: Optional[str] = None
    address2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None

class BusinessPatch(BaseModel):
    name: Optional[str] = None
    website_url: Optional[str] = None
    address1: Optional[str] = None
    address2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None


class InvestmentCreate(BaseModel):
    business_id: int
    shares_available: int
    price_per_share: float
    min_investment: int
    start_date: datetime
    expiration_date: datetime


class InvestmentOut(InvestmentCreate):
    id: int
    featured: bool
    model_config = ConfigDict(from_attributes=True)

class PurchaseCreateIn(BaseModel):
    investment_id: int
    shares_purchased: int
    cost_per_share: float
    purchase_date: datetime

class PurchaseCreate(PurchaseCreateIn):
    user_id: int


class PurchaseOut(PurchaseCreate):
    id: int
    status: PurchaseStatus
    model_config = ConfigDict(from_attributes=True)

class PurchaseSummaryOut(BaseModel):
    id: int
    user_id: int
    shares_purchased: int

    model_config = ConfigDict(from_attributes=True)

class InvestmentWithPurchasesOut(InvestmentOut):
    purchases: List[PurchaseSummaryOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


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
    business_image_url: Optional[str] = None
    business_website_url: str
    model_config = ConfigDict(from_attributes=True)

class FinancialsCreate(BaseModel):
    business_id: int
    date: date
    amount: float
    type: FinancialType

    @field_validator("date", mode="before")
    @classmethod
    def parse_mm_yyyy(cls, v):
        if isinstance(v, str):
            if not re.match(r"^(0[1-9]|1[0-2])/\d{4}$", v):
                raise ValueError("Date must be in 'MM/YYYY' format")
            month, year = map(int, v.split("/"))
            return date(year, month, 1)
        elif isinstance(v, date):
            return date(v.year, v.month, 1)
        raise ValueError("Invalid date format")


class FinancialsOut(FinancialsCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
