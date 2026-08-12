# Aarisha

Luxury accessories storefront with a vanilla-JS marketing site and a FastAPI/Supabase catalogue API.

## Run the API

1. Create a Supabase project and run `supabase-schema.sql` in its SQL editor.
2. Copy `backend/.env.example` to `backend/.env`, set every value, and keep the service-role key server-side.
3. Install and run:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. Serve the `frontend/` folder with a static server (e.g. `cd frontend && python -m http.server 5500`). The frontend uses `http://127.0.0.1:8000` locally.

## Deploy to Vercel

The repository includes a same-domain FastAPI function at `/api`, and the static frontend lives in `frontend/` (served at the site root via `vercel.json` rewrites). Add the values from `backend/.env` as Vercel Production environment variables (do not upload the `.env` file), then redeploy. The deployed storefront automatically uses `/api`; local development continues to use `http://127.0.0.1:8000`.

API documentation is available at `/docs` while the server is running.

## API routes

- `GET /products` and `GET /products/{category}` are public catalogue routes.
- `POST /orders/whatsapp-link` creates a WhatsApp draft from current server-side product prices; it does not record an order.

Product data is managed directly in the Supabase `products` table (Supabase dashboard or SQL editor).

## Security

`SUPABASE_SERVICE_ROLE_KEY` and `BRAND_WHATSAPP_NUMBER` belong only in backend environment variables. Do not expose them in browser code, commits, or static-host configuration. The browser receives a WhatsApp deep link only after asking the API to generate one; the phone number is not present in the page source, though it remains visible in the eventual `wa.me` destination by design.
