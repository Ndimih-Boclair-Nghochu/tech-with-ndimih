from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from rest_framework import status


class ProductUploadValidationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass')
        # force authenticate in tests
        self.client.force_authenticate(user=self.user)

    def test_large_file_rejected(self):
        max_mb = getattr(settings, 'MAX_PRODUCT_MB', 25)
        # create a file larger than MAX_PRODUCT_MB
        size = max_mb * 1024 * 1024 + 10
        big = SimpleUploadedFile('big.zip', b'a' * size, content_type='application/zip')
        data = {'title': 'Too big', 'price_cents': 100, 'file': big}
        resp = self.client.post('/api/products/', data, format='multipart')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('file', resp.data)

    def test_bad_file_type_rejected(self):
        bad = SimpleUploadedFile('evil.exe', b'data', content_type='application/x-msdownload')
        data = {'title': 'Bad type', 'price_cents': 100, 'file': bad}
        resp = self.client.post('/api/products/', data, format='multipart')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('file', resp.data)
