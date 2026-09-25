import os
import unittest
from unittest.mock import patch
from urllib.parse import unquote

os.environ.setdefault("SUPABASE_URL", "https://mock.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "mock-service-key")
os.environ.setdefault("BRAND_WHATSAPP_NUMBER", "+919157756560")

from fastapi.testclient import TestClient
from backend.app.main import app


class WhatsAppOrderTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_missing_customer_name_rejected(self):
        res = self.client.post("/orders/whatsapp-link", json={
            "items": [{"product_id": "test-prod-1", "quantity": 1}],
            "customer_phone": "9876543210"
        })
        self.assertEqual(res.status_code, 422)

    def test_missing_customer_phone_rejected(self):
        res = self.client.post("/orders/whatsapp-link", json={
            "items": [{"product_id": "test-prod-1", "quantity": 1}],
            "customer_name": "Priya Sharma"
        })
        self.assertEqual(res.status_code, 422)

    def test_whitespace_name_rejected(self):
        res = self.client.post("/orders/whatsapp-link", json={
            "items": [{"product_id": "test-prod-1", "quantity": 1}],
            "customer_name": "   ",
            "customer_phone": "9876543210"
        })
        self.assertEqual(res.status_code, 422)

    @patch("backend.app.main.supabase")
    def test_valid_order_includes_customer_details(self, mock_supabase):
        mock_supabase.return_value = [{"name": "Royal Kundan Ring", "price": 1499, "in_stock": True}]
        res = self.client.post("/orders/whatsapp-link", json={
            "items": [{"product_id": "prod-123", "quantity": 2}],
            "customer_name": "Priya Sharma",
            "customer_phone": "+91 98765 43210"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("url", data)
        decoded_url = unquote(data["url"])
        self.assertIn("Customer Details:", decoded_url)
        self.assertIn("Name: Priya Sharma", decoded_url)
        self.assertIn("Mobile: +91 98765 43210", decoded_url)
        self.assertIn("Royal Kundan Ring", decoded_url)


if __name__ == "__main__":
    unittest.main()
