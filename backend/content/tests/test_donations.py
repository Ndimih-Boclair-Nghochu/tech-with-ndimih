from django.test import TestCase, Client
from django.urls import reverse
from django.conf import settings
from ..models import Donation
import json


class DonationTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_create_donation_session_without_stripe(self):
        url = reverse('donate_create_session')
        resp = self.client.post(url, data=json.dumps({'amount_cents': 100}), content_type='application/json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('detail', resp.json())

    def test_paypal_webhook_marks_donation(self):
        # create a pending donation with a known paypal_txn_id
        d = Donation.objects.create(amount_cents=500, paypal_txn_id='ORDER123', status='pending')
        url = reverse('donate_paypal_webhook')
        payload = {
            'event_type': 'PAYMENT.CAPTURE.COMPLETED',
            'resource': {
                'id': 'ORDER123',
                'amount': {'value': '5.00', 'currency_code': 'USD'},
                'payer': {'email_address': 'donor@example.com'}
            }
        }
        resp = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        d.refresh_from_db()
        self.assertEqual(d.status, 'succeeded')
        self.assertEqual(d.email, 'donor@example.com')
*** End Patch