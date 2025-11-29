from django.test import TestCase
from .models import Portfolio


class PortfolioModelTest(TestCase):
    def test_create_portfolio(self):
        p = Portfolio.objects.create(title='Test Project', excerpt='Short')
        self.assertTrue(p.slug.startswith('test-project'))
        self.assertEqual(p.excerpt, 'Short')
