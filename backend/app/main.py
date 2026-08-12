"""FastAPI API for Aarisha. All Supabase access uses the server-side service key."""
from __future__ import annotations

from decimal import Decimal
from enum import Enum

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    supabase_url: str
    supabase_service_role_key: str
    brand_whatsapp_number: str
    allowed_origins: str = "http://127.0.0.1:5500,http://localhost:5500"


settings = Settings()
app = FastAPI(title="Aarisha API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(",")],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class Category(str, Enum):
    rings = "rings"
    necklaces = "necklaces"
    bracelets = "bracelets"
    earrings = "earrings"


class WhatsAppItem(BaseModel):
    product_id: str = Field(min_length=1, max_length=80)
    quantity: int = Field(ge=1, le=99)


class WhatsAppOrder(BaseModel):
    items: list[WhatsAppItem] = Field(min_length=1, max_length=50)


async def supabase(method: str, table: str, *, params: dict | None = None, payload: object | None = None, prefer: str | None = None):
    headers = {"apikey": settings.supabase_service_role_key, "Authorization": f"Bearer {settings.supabase_service_role_key}"}
    if prefer:
        headers["Prefer"] = prefer
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.request(method, f"{settings.supabase_url.rstrip('/')}/rest/v1/{table}", headers=headers, params=params, json=payload)
    if response.is_error:
        try:
            err_data = response.json()
            err_msg = f"Database operation failed: {err_data.get('message', response.text)}"
        except Exception:
            err_msg = f"Database operation failed ({response.status_code}): {response.text}"
        raise HTTPException(status_code=502, detail=err_msg)
    return response.json() if response.content else []


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/products")
async def products():
    return await supabase("GET", "products", params={"select": "*", "order": "created_at.desc"})


@app.get("/products/{category}")
async def products_by_category(category: Category):
    return await supabase("GET", "products", params={"category": f"eq.{category.value}", "select": "*", "order": "created_at.desc"})


@app.post("/orders/whatsapp-link")
async def whatsapp_link(order: WhatsAppOrder):
    """Create a WhatsApp draft only; it neither takes payment nor records an order."""
    lines, total = [], Decimal("0")
    for item in order.items:
        rows = await supabase("GET", "products", params={"id": f"eq.{item.product_id}", "select": "name,price,in_stock"})
        if not rows or not rows[0]["in_stock"]:
            raise HTTPException(status_code=422, detail="One or more products are unavailable")
        product = rows[0]
        price = Decimal(str(product["price"]))
        total += price * item.quantity
        lines.append(f"{len(lines) + 1}. {product['name']} - Qty: {item.quantity} - INR {price:,.2f} each")
    from urllib.parse import quote
    message = "Hi Aarisha! I'd like to order:\n" + "\n".join(lines) + f"\nTotal: INR {total:,.2f}"
    return {"url": f"https://wa.me/{settings.brand_whatsapp_number}?text={quote(message)}"}
