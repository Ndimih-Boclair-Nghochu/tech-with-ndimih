from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortfolioViewSet, contact_view, upload_view, robots_txt, sitemap_xml, tags_list
from .views import contact_files_view
from .views import ProductViewSet, BlogPostViewSet, purchase_product, product_click_redirect, affiliate_stats, affiliate_clicks_csv, ReviewViewSet, create_donation_session, donate_webhook, create_paypal_order, paypal_webhook, donation_report_csv
from .views import ServiceViewSet, SkillViewSet, CVViewSet, CertificationViewSet, AboutViewSet, HeroViewSet, DonationInfoViewSet, BankDetailViewSet, GiftCardViewSet
from .views import NewsletterViewSet, ProjectForSaleViewSet

router = DefaultRouter()
router.register(r'portfolio', PortfolioViewSet, basename='portfolio')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'projects-for-sale', ProjectForSaleViewSet, basename='project-for-sale')
router.register(r'blog', BlogPostViewSet, basename='blog')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'cv', CVViewSet, basename='cv')
router.register(r'certifications', CertificationViewSet, basename='certification')
router.register(r'about', AboutViewSet, basename='about')
router.register(r'hero', HeroViewSet, basename='hero')
router.register(r'donation-info', DonationInfoViewSet, basename='donation-info')
router.register(r'bank-details', BankDetailViewSet, basename='bank-detail')
router.register(r'gift-cards', GiftCardViewSet, basename='gift-card')
router.register(r'newsletter', NewsletterViewSet, basename='newsletter')

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', contact_view, name='contact'),
    path('contact/files/', contact_files_view, name='contact_files'),
    path('upload/', upload_view, name='upload'),
    path('tags/', tags_list, name='tags'),
    path('robots.txt', robots_txt),
    path('sitemap.xml', sitemap_xml),
    path('products/<int:pk>/purchase/', purchase_product, name='purchase_product'),
    path('products/<int:pk>/go/', product_click_redirect, name='product_go'),
    path('affiliate/<int:pk>/stats/', affiliate_stats, name='affiliate_stats'),
    path('affiliate/<int:pk>/csv/', affiliate_clicks_csv, name='affiliate_csv'),
    path('donate/create-session/', create_donation_session, name='donate_create_session'),
    path('donate/webhook/', donate_webhook, name='donate_webhook'),
    path('donate/paypal-create/', create_paypal_order, name='donate_paypal_create'),
    path('donate/paypal-webhook/', paypal_webhook, name='donate_paypal_webhook'),
    path('donate/report/csv/', donation_report_csv, name='donation_report_csv'),
]
