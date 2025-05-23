from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic_schemas import OfferOut, BusinessOut, FinancialsOut, PurchaseCreate, EnrichedPurchaseOut
from pathlib import Path
from typing import List
import db
from db import get_purchases_by_status
from db_models import PurchaseStatus
from rich import print  # debugging


app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/offer/{offer_id}")
async def get_offer(offer_id: int) -> OfferOut:
    offer = db.get_offer(offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@app.get("/api/offer")
async def get_offers() -> list[OfferOut]:
    return db.get_offers()


@app.get("/api/business/{business_id}")
async def get_business(business_id: int) -> BusinessOut:
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business


@app.get("/api/business")
async def get_businesses() -> list[BusinessOut]:
    return db.get_businesses()


@app.get("/api/purchases/{user_id}", response_model=List[EnrichedPurchaseOut])
async def get_user_purchases(
    user_id: int,
    status: PurchaseStatus = Query(PurchaseStatus.pending)  # default to 'pending'
):
    purchases = get_purchases_by_status(user_id, status)
    if not purchases:
        raise HTTPException(status_code=404, detail=f"No {status} purchases found")
    return purchases


@app.get("/api/financials/{business_id}", response_model=list[FinancialsOut])
def get_financials_for_business(business_id: int):
    financials = db.get_financials_by_business_id(business_id)
    if not financials:
        raise HTTPException(status_code=404, detail="Financials not found for business")
    return financials


@app.get("/{file_path}", response_class=FileResponse)
def get_static_file(file_path: str):
    if Path("static/" + file_path).is_file():
        return "static/" + file_path
    raise HTTPException(status_code=404, detail="Item not found")


@app.post("/api/purchases", status_code=201)  # status code 201 indicates success
async def post_purchase(purchase_request: PurchaseCreate):
    try:
        purchase = db.add_purchase(purchase_request)
        return purchase
    except Exception as e:
        if str(e) == "NotEnoughSharesException":
            raise HTTPException(status_code=400, detail="Not enough shares available.")
        else:
            print(f"Unexpected error: {e}")
            raise HTTPException(
                status_code=500, detail="Something went wrong on the server."
            )
