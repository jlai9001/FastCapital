from fastapi import FastAPI, HTTPException
from pydantic_schemas import OfferOut, BusinessOut
import db


app = FastAPI()


@app.get("/api/offer/{offer_id}")
async def get_offer(offer_id: int) -> OfferOut:
    offer = db.get_offer(offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@app.get("/api/business/{business_id}")
async def get_business(business_id: int) -> BusinessOut:
    business = db.get_business(business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business
