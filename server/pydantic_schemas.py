from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


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
    address2: str
    city: str
    state: str
    postal_code: str


class BusinessOut(BusinessCreate):
    id: int
    name: str
    users_id: int
    image_url: str
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    postal_code: str


class OfferCreate(BaseModel):
    business_id: int
    shares_available: int
    price_per_share: float
    min_investment: int
    start_date: date
    expiration_date: date


class OfferOut(OfferCreate):
    id: int
    business_id: int
    shares_available: int
    price_per_share: float
    min_investment: int
    start_date: date
    expiration_date: date
    featured: bool


class PurchaseCreate(BaseModel):
    offer_id: int
    users_id: int
    shares_purchased: int
    cost_per_share: float
    purchase_date: datetime


class PurchaseOut(PurchaseCreate):
    id: int
    offer_id: int
    users_id: int
    shares_purchased: int
    cost_per_share: float
    purchase_date: datetime
    status: str


class FinancialsCreate(BaseModel):
    business_id: int
    date: date
    amount: float
    type: str


class FinancialsOut(FinancialsCreate):
    id: int
    business_id: int
    date: date
    amount: float
    type: str

############################################ Login Session by Jonathan

class LoginCredentials(BaseModel):
    email: str
    password: str

class SignupCredentials(BaseModel):
    name: str
    email: str
    password: str

class SuccessResponse(BaseModel):
    success: bool


class SecretResponse(BaseModel):
    secret: str


class UserPublicDetails(BaseModel):
    email: str
