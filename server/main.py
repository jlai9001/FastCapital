from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic_schemas import OfferOut, BusinessOut
from pathlib import Path
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


@app.get("/{file_path}", response_class=FileResponse)
def get_static_file(file_path: str):
    if Path("static/" + file_path).is_file():
        return "static/" + file_path
    raise HTTPException(status_code=404, detail="Item not found")
