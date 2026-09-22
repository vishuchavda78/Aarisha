"""FastAPI API for Aarisha. All Supabase access uses the server-side service key."""
from __future__ import annotations

from decimal import Decimal
from enum import Enum
import json
import logging
import os
import time

import httpx
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2 import service_account
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("uvicorn.error")


ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_FILES = (
    os.path.join(ROOT_DIR, ".env"),
    os.path.join(ROOT_DIR, "backend", ".env"),
    ".env",
    "backend/.env",
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILES, extra="ignore")
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    brand_whatsapp_number: str = "919924343003"
    instagram_access_token: str | None = None
    allowed_origins: str = "http://127.0.0.1:5500,http://localhost:5500"
    google_spreadsheet_id: str | None = None
    google_service_account_file: str | None = "service_account.json"
    google_service_account_json: str | None = None


settings = Settings()
app = FastAPI(title="Aarisha API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(",")],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

_google_creds: service_account.Credentials | None = None


def get_google_credentials() -> service_account.Credentials | None:
    global _google_creds
    if _google_creds is not None:
        return _google_creds

    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    if settings.google_service_account_json:
        try:
            info = json.loads(settings.google_service_account_json)
            _google_creds = service_account.Credentials.from_service_account_info(info, scopes=scopes)
            return _google_creds
        except Exception as e:
            logger.warning(f"Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON: {e}")

    if settings.google_service_account_file:
        candidate_paths = [
            settings.google_service_account_file,
            os.path.join(os.getcwd(), settings.google_service_account_file),
            os.path.join(os.path.dirname(__file__), "..", settings.google_service_account_file),
            os.path.join(os.path.dirname(__file__), "..", "..", "backend", settings.google_service_account_file),
        ]
        for p in candidate_paths:
            norm = os.path.normpath(p)
            if os.path.isfile(norm):
                try:
                    _google_creds = service_account.Credentials.from_service_account_file(norm, scopes=scopes)
                    return _google_creds
                except Exception as e:
                    logger.warning(f"Failed to load service account file {norm}: {e}")
                    break

    return None


def get_google_access_token() -> str | None:
    creds = get_google_credentials()
    if not creds:
        return None
    try:
        if not creds.valid:
            creds.refresh(GoogleAuthRequest())
        return creds.token
    except Exception as e:
        logger.warning(f"Failed to refresh Google access token: {e}")
        return None


def normalize_phone_core(phone: str) -> str:
    """Extract core phone digits for deduplication (e.g. last 10 digits for Indian mobiles)."""
    digits = "".join(filter(str.isdigit, phone))
    return digits[-10:] if len(digits) > 10 else digits


async def sync_customer_to_google_sheet(name: str, phone: str) -> None:
    """Background task: Log customer name and phone to Google Sheet if not already present."""
    if not settings.google_spreadsheet_id:
        return

    token = get_google_access_token()
    if not token:
        logger.warning("Google Sheet sync skipped: Unable to obtain Google access token.")
        return

    core_phone = normalize_phone_core(phone)
    if not core_phone:
        return

    sheet_id = settings.google_spreadsheet_id.strip()
    headers = {"Authorization": f"Bearer {token}"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            get_resp = await client.get(
                f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/Sheet1!B:B",
                headers=headers,
            )
            if get_resp.is_success:
                existing_rows = get_resp.json().get("values", [])
                for row in existing_rows[1:]:
                    if row and normalize_phone_core(str(row[0])) == core_phone:
                        logger.info(f"Google Sheet: Customer {phone} ({core_phone}) already recorded. Skipping duplicate.")
                        return

            append_resp = await client.post(
                f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/Sheet1!A:B:append?valueInputOption=RAW",
                headers=headers,
                json={"values": [[name, phone]]},
            )
            if append_resp.is_success:
                logger.info(f"Google Sheet: Successfully logged customer {name} ({phone})")
            else:
                logger.warning(f"Google Sheet append failed ({append_resp.status_code}): {append_resp.text}")
    except Exception as e:
        logger.warning(f"Google Sheet sync background task encountered an error: {e}")


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
    customer_name: str = Field(min_length=1, max_length=100)
    customer_phone: str = Field(min_length=5, max_length=30)


async def supabase(method: str, table: str, *, params: dict | None = None, payload: object | None = None, prefer: str | None = None):
    if not settings.supabase_url or not settings.supabase_service_role_key:
        logger.error("Supabase credentials not configured in environment variables.")
        raise HTTPException(
            status_code=500,
            detail="Database configuration missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.",
        )
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


@app.get("/brand/contact")
async def brand_contact():
    clean_num = "".join(filter(str.isdigit, settings.brand_whatsapp_number))
    return {
        "whatsapp_number": settings.brand_whatsapp_number,
        "digits": clean_num,
        "whatsapp_url": f"https://wa.me/{clean_num}",
        "tel_url": f"tel:+{clean_num}" if not settings.brand_whatsapp_number.startswith("+") else f"tel:{settings.brand_whatsapp_number}",
    }


@app.get("/products")
async def products():
    return await supabase("GET", "products", params={"select": "*", "order": "created_at.desc"})


@app.get("/products/{category}")
async def products_by_category(category: Category):
    return await supabase("GET", "products", params={"category": f"eq.{category.value}", "select": "*", "order": "created_at.desc"})


@app.post("/orders/whatsapp-link")
async def whatsapp_link(order: WhatsAppOrder, background_tasks: BackgroundTasks):
    """Create a WhatsApp draft only; it neither takes payment nor records an order."""
    name = order.customer_name.strip()
    phone = order.customer_phone.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Customer name cannot be empty")
    if not phone:
        raise HTTPException(status_code=422, detail="Customer mobile number cannot be empty")

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
    clean_num = "".join(filter(str.isdigit, settings.brand_whatsapp_number))
    msg_lines = ["Hi Aarisha! I'd like to order:", ""]
    msg_lines.extend(lines)
    msg_lines.append("")
    msg_lines.append(f"Total: INR {total:,.2f}")
    msg_lines.append("")
    msg_lines.append("Customer Details:")
    msg_lines.append(f"Name: {name}")
    msg_lines.append(f"Mobile: {phone}")
    message = "\n".join(msg_lines)

    # Asynchronously sync unique customer to Google Sheet
    background_tasks.add_task(sync_customer_to_google_sheet, name, phone)

    return {"url": f"https://wa.me/{clean_num}?text={quote(message)}"}


# Instagram feed — cached 10 minutes (Graph API rate limit is 200 calls/hour).
# The token lives server-side only; with no token (or an upstream failure) the
# route returns an empty list so the storefront falls back to placeholder tiles.
_instagram_cache: dict = {"ts": 0.0, "posts": []}
INSTAGRAM_FEED_TTL = 600


@app.get("/instagram/posts")
async def instagram_posts():
    now = time.monotonic()
    if now - _instagram_cache["ts"] < INSTAGRAM_FEED_TTL:
        return _instagram_cache["posts"]

    posts: list[dict] = []
    token = settings.instagram_access_token
    if token:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(
                    "https://graph.instagram.com/me/media",
                    params={
                        "fields": "id,caption,media_type,media_url,thumbnail_url,permalink",
                        "limit": 6,
                        "access_token": token,
                    },
                )
            if response.is_success:
                for media in response.json().get("data", [])[:5]:
                    caption = (media.get("caption") or "").strip()
                    posts.append({
                        "id": media.get("id"),
                        "alt": caption[:120] or "Aarisha on Instagram",
                        "image": media.get("media_url") if media.get("media_type") == "IMAGE" else (media.get("thumbnail_url") or media.get("media_url")),
                        "permalink": media.get("permalink"),
                    })
        except Exception:
            posts = []

    _instagram_cache.update({"ts": now, "posts": posts})
    return posts
