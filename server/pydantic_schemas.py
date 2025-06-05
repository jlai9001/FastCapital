from pydantic import BaseModel, EmailStr, validator, ConfigDict
from datetime import date, datetime
from typing import Optional, List
import enum
import re  # this helps the Bowe validate date format


class LoginCredentials(BaseModel):
    email: EmailStr
    password: str


class SignupCredentials(BaseModel):
    name: str
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


class PurchaseSummaryOut(BaseModel):
    id: int
    shares_purchased: int

    model_config = ConfigDict(from_attributes=True)

class InvestmentWithPurchasesOut(InvestmentOut):
    purchases: List[PurchaseSummaryOut] = []

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

    @validator("business_image_url", pre=True)
    def sanitize_image_url(cls, v):
        if not v or not isinstance(v, str):
            return None
        invalid_values = ["", "null", "undefined"]
        if any(invalid in v.lower() for invalid in invalid_values):
            return None
        if "example.com" in v.lower():
            return None
        return v


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

    @validator("date", pre=True)
    def parse_mm_yyyy(cls, v):
        if isinstance(v, str):
            # validates format MM/YYYY
            if not re.match(r"^(0[1-9]|1[0-2])/\d{4}$", v):
                raise ValueError("Date must be in 'MM/YYYY' format")
            month, year = map(int, v.split("/"))
            return date(year, month, 1)
        elif isinstance(v, date):
            # strips day in case it passed first validation
            return date(v.year, v.month, 1)
        raise ValueError("Invalid date format")


class FinancialsOut(FinancialsCreate):
    id: int
