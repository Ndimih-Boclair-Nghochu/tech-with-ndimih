from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.core.files.storage import default_storage
import uuid
import os
from django.conf import settings
import requests
from django.http import HttpResponse, JsonResponse
from django.http import HttpResponseRedirect
from django.db.models import Count
from django.db.models import F
from django.db.models.functions import TruncDate
from ratelimit.decorators import ratelimit

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.urls import reverse

from .models import Portfolio, PortfolioImage, Tag
from .models import Product, BlogPost, AffiliateClick, Review, Donation, Service, Skill, CV, Certification, About, Hero, DonationInfo, BankDetail, GiftCard
import os
from .serializers import PortfolioSerializer, PortfolioImageSerializer

from .serializers import ProductSerializer, BlogPostSerializer, ReviewSerializer, ServiceSerializer, SkillSerializer, CVSerializer, CertificationSerializer, AboutSerializer, HeroSerializer, DonationInfoSerializer, BankDetailSerializer, GiftCardSerializer
from .models import Product, BlogPost
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

try:
    import stripe
    stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')
except Exception:
    stripe = None


class PortfolioViewSet(viewsets.ModelViewSet):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer
    lookup_field = 'slug'
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        # return permission instances
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # serializer will handle file fields if present in multipart/form-data
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def get_queryset(self):
        qs = Portfolio.objects.all()
        tag = None
        if hasattr(self, 'request'):
            tag = self.request.query_params.get('tag')
        if tag:
            # filter by tag name (case-insensitive)
            qs = qs.filter(tags__name__iexact=tag)
        return qs


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
@ratelimit(key='ip', rate='10/m', block=True)
def contact_view(request):
    """Accepts name, email, message and optional file uploads (cv, certifications[]).

    Files are saved to the default storage under `contact/` and public URLs
    are included in the notification email. This endpoint is rate-limited.
    """
    data = request.data
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    if not name or not email or not message:
        return Response({'detail': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

    # File uploads are disabled via the public contact form. Files should
    # be uploaded via the Django admin (ContactFile model). This prevents
    # arbitrary public uploads. Keep saved_links empty for email clarity.
    saved_links = []

    # send email (configured via env)
    subject = f"Website contact from {name}"
    body = f"New contact form submission from your website:\n\n"
    body += f"Name: {name}\n"
    body += f"Email: {email}\n"
    body += f"Message:\n{message}\n\n"
    if saved_links:
        body += "Uploaded files:\n"
        for s in saved_links:
            body += f"- {s['type']}: {s['name']} -> {s['url']}\n"
    
    # Get recipient email from settings (defaults to DEFAULT_FROM_EMAIL if not set)
    recipient_email = getattr(settings, 'CONTACT_EMAIL_RECIPIENT', settings.DEFAULT_FROM_EMAIL)
    
    # Ensure we always send to the configured recipient
    if not recipient_email:
        recipient_email = 'ndimihboclair4@gmail.com'
    
    try:
        send_mail(
            subject, 
            body, 
            settings.DEFAULT_FROM_EMAIL, 
            [recipient_email],
            fail_silently=False
        )
        return Response({'detail': 'Sent', 'files': saved_links})
    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        error_msg = str(e)
        logger.error(f"Failed to send contact email: {error_msg}")
        
        # Provide more helpful error messages
        if 'authentication failed' in error_msg.lower() or 'invalid credentials' in error_msg.lower():
            detail_msg = 'Email authentication failed. Please configure EMAIL_HOST_PASSWORD in .env file with a Gmail App Password. See EMAIL_SETUP.md for instructions.'
        elif 'connection' in error_msg.lower() or 'timeout' in error_msg.lower():
            detail_msg = 'Could not connect to email server. Please check your internet connection and email settings.'
        elif 'password' in error_msg.lower():
            detail_msg = 'Email password is incorrect or not set. Please check EMAIL_HOST_PASSWORD in .env file.'
        else:
            detail_msg = f'Email delivery failed: {error_msg}. Please check your email configuration.'
        
        return Response(
            {'detail': detail_msg}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def contact_files_view(request):
    """Return a list of admin-uploaded `ContactFile` records so the frontend
    can present download links. This is safer and more robust than scanning
    the media directory directly.
    """
    try:
        from .models import ContactFile
    except Exception:
        return Response([], status=status.HTTP_200_OK)

    qs = ContactFile.objects.order_by('-created_at')
    out = []
    for cf in qs:
        try:
            url = request.build_absolute_uri(cf.file.url)
        except Exception:
            url = ''
        out.append({'name': cf.label or cf.file.name.split('/')[-1], 'url': url, 'type': cf.file_type})
    return Response(out)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_view(request):
    f = request.FILES.get('file')
    if not f:
        return Response({'detail': 'No file'}, status=status.HTTP_400_BAD_REQUEST)
    # server-side validation
    max_mb = int(getattr(settings, 'MAX_UPLOAD_MB', 10))
    if f.size > max_mb * 1024 * 1024:
        return Response({'detail': 'File too large'}, status=status.HTTP_400_BAD_REQUEST)
    allowed = ['image/png', 'image/jpeg', 'application/pdf']
    if f.content_type not in allowed:
        return Response({'detail': 'Invalid file type'}, status=status.HTTP_400_BAD_REQUEST)
    # optional portfolio link
    portfolio_id = request.data.get('portfolio_id')
    portfolio = None
    if portfolio_id:
        try:
            portfolio = Portfolio.objects.get(id=portfolio_id)
        except Portfolio.DoesNotExist:
            return Response({'detail': 'Portfolio not found'}, status=status.HTTP_400_BAD_REQUEST)
    # save image (portfolio may be None)
    obj = PortfolioImage(portfolio=portfolio, image=f)
    obj.save()
    serializer = PortfolioImageSerializer(obj)
    return Response(serializer.data)


def robots_txt(request):
    content = "User-agent: *\nDisallow: /admin/\n"
    return HttpResponse(content, content_type='text/plain')


def sitemap_xml(request):
    items = Portfolio.objects.all()
    host = request.build_absolute_uri('/')[:-1]
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    # static pages
    for path in ['/', '/services', '/portfolio', '/blog', '/contact']:
        lines.append('<url><loc>{}</loc></url>'.format(host + path))
    for it in items:
        lines.append('<url><loc>{}</loc></url>'.format(host + f'/portfolio/{it.slug}'))
    lines.append('</urlset>')
    return HttpResponse('\n'.join(lines), content_type='application/xml')


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@cache_page(60 * 60)  # cache tag list for 1 hour
def tags_list(request):
    # return tags with counts for UI (e.g., [{name: 'web', count: 5}, ...])
    qs = Tag.objects.annotate(count=Count('portfolios')).order_by('-count', 'name')
    data = [{'name': t.name, 'count': t.count} for t in qs]
    return Response(data)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    # accept file uploads on create/update
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        # require authentication for create/update/delete, allow list/retrieve to all
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        product = serializer.save()
        # If Stripe is available and a price is set, create Stripe Product and Price
        try:
            if stripe and product.price_cents and product.price_cents > 0:
                # create stripe product if not present
                if not product.stripe_product_id:
                    stripe_prod = stripe.Product.create(name=product.title, description=product.description or '')
                    product.stripe_product_id = stripe_prod.id
                # create price
                price = stripe.Price.create(unit_amount=int(product.price_cents), currency='usd', product=product.stripe_product_id)
                product.stripe_price_id = price.id
                product.save()
        except Exception:
            # don't fail creation if Stripe is misconfigured; log optionally
            pass

    def perform_update(self, serializer):
        # serializer will handle file replacement if provided in multipart/form-data
        # detect price changes and create Stripe Price when necessary
        # fetch previous price
        instance = getattr(serializer, 'instance', None)
        previous_price = None
        if instance and instance.pk:
            try:
                prev = Product.objects.get(pk=instance.pk)
                previous_price = prev.price_cents
            except Product.DoesNotExist:
                previous_price = None

        product = serializer.save()
        try:
            if stripe and product.price_cents and product.price_cents > 0:
                # ensure stripe_product exists
                if not product.stripe_product_id:
                    stripe_prod = stripe.Product.create(name=product.title, description=product.description or '')
                    product.stripe_product_id = stripe_prod.id
                # if price changed or no stripe_price_id, create a new Price
                if previous_price != product.price_cents or not product.stripe_price_id:
                    price = stripe.Price.create(unit_amount=int(product.price_cents), currency='usd', product=product.stripe_product_id)
                    product.stripe_price_id = price.id
                    product.save()
        except Exception:
            # do not let Stripe errors block update
            pass


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        qs = BlogPost.objects.all()
        # Optionally filter by published status if needed
        return qs


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    pagination_class = None  # Disable pagination to show all services

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Service.objects.all()
        # Only show published services to public
        if self.action in ['list', 'retrieve']:
            qs = qs.filter(is_published=True)
        return qs.order_by('order', 'title')


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Skill.objects.all()
        # Only show published skills to public
        if self.action in ['list', 'retrieve']:
            qs = qs.filter(is_published=True)
        return qs.order_by('order', 'name')


class CVViewSet(viewsets.ModelViewSet):
    queryset = CV.objects.all()
    serializer_class = CVSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = CV.objects.all()
        # Only show active CV to public
        if self.action in ['list', 'retrieve']:
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all()
    serializer_class = CertificationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Certification.objects.all()
        # Only show published certifications to public
        if self.action in ['list', 'retrieve']:
            qs = qs.filter(is_published=True)
        return qs.order_by('order', '-issue_date', 'title')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class AboutViewSet(viewsets.ModelViewSet):
    queryset = About.objects.all()
    serializer_class = AboutSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = About.objects.all()
        # Only show published about page to public
        if self.action in ['list', 'retrieve']:
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        # Delete existing about page before creating new one
        About.objects.all().delete()
        return super().create(request, *args, **kwargs)


class HeroViewSet(viewsets.ModelViewSet):
    queryset = Hero.objects.all()
    serializer_class = HeroSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = Hero.objects.all()
        # Only show published hero to public
        if self.action in ['list', 'retrieve']:
            qs = qs.filter(is_published=True)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        # Delete existing hero before creating new one
        Hero.objects.all().delete()
        return super().create(request, *args, **kwargs)


class ReviewViewSet(viewsets.ModelViewSet):
    """Create and list reviews. Listing returns only published reviews. Creating is open to anonymous users but rate-limited.
    Reviews are NEVER deleted - they are permanently stored for historical purposes."""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    pagination_class = None  # Disable pagination for reviews - return all reviews

    def get_permissions(self):
        # anyone can create and list public reviews; other actions require auth
        if self.action in ['create', 'list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Review.objects.all()
        # only published for public listing
        if self.action in ['list']:
            qs = qs.filter(is_published=True)
        # Always return all reviews (no pagination limit for reviews)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        # Auto-publish reviews so they appear immediately on the home page
        # Reviews are still stored permanently and can be unpublished by admin if needed
        serializer.save(is_published=True)

    def destroy(self, request, *args, **kwargs):
        """Prevent deletion of reviews - they are permanently stored"""
        return Response(
            {'detail': 'Reviews cannot be deleted. They are permanently stored for historical purposes. You can unpublish them instead.'},
            status=status.HTTP_403_FORBIDDEN
        )


class DonationInfoViewSet(viewsets.ModelViewSet):
    queryset = DonationInfo.objects.all()
    serializer_class = DonationInfoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = DonationInfo.objects.all()
        # Only show active donation info to public
        if self.action in ['list', 'retrieve']:
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        # Ensure only one DonationInfo instance exists
        DonationInfo.objects.all().delete()
        return super().create(request, *args, **kwargs)


class BankDetailViewSet(viewsets.ModelViewSet):
    queryset = BankDetail.objects.all()
    serializer_class = BankDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class GiftCardViewSet(viewsets.ModelViewSet):
    queryset = GiftCard.objects.all()
    serializer_class = GiftCardSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        # Anyone can upload gift cards, but only authenticated users can view/delete them
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def purchase_product(request, pk):
    """Create a Stripe Checkout session if configured, otherwise return download URL for free products."""
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    # If product is an affiliate link, return external redirect URL
    if product.affiliate_url:
        # return the server-side go endpoint so the click can be recorded
        go_url = request.build_absolute_uri(reverse('product_go', args=[product.pk]))
        return Response({'type': 'external', 'url': go_url})

    if product.price_cents == 0 and product.file:
        # return direct URL to file
        return Response({'type': 'download', 'url': request.build_absolute_uri(product.file.url)})

    if stripe and product.stripe_price_id:
        # create checkout session
        domain = request.build_absolute_uri('/')[:-1]
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': product.stripe_price_id,
                    'quantity': 1,
                }],
                mode='payment',
                success_url=domain + '/?checkout=success',
                cancel_url=domain + '/?checkout=cancel',
            )
            return Response({'type': 'stripe', 'checkout_url': session.url})
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'detail': 'Payment gateway not configured or product not available for purchase'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def product_click_redirect(request, pk):
    """Server-side redirect for affiliate links that logs a click before redirecting."""
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    if not product.affiliate_url:
        return Response({'detail': 'No affiliate URL'}, status=status.HTTP_400_BAD_REQUEST)

    # increment click counter atomically
    # detect bot-like UAs and skip logging if detected
    ua = request.META.get('HTTP_USER_AGENT', '') or ''
    def is_bot(ua_str):
        u = ua_str.lower()
        bot_indicators = ['bot', 'spider', 'crawl', 'curl', 'wget', 'python-requests', 'monitoring', 'uptime', 'slurp', 'bingpreview', 'facebookexternalhit', 'headless']
        for b in bot_indicators:
            if b in u:
                return True
        return False

    client_ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
    referer = request.META.get('HTTP_REFERER', '')

    recorded = False
    if not is_bot(ua):
        # increment aggregate counter
        Product.objects.filter(pk=product.pk).update(affiliate_clicks=F('affiliate_clicks') + 1)
        # store detailed click
        AffiliateClick.objects.create(product=product, ip=client_ip, user_agent=ua, referer=referer)
        recorded = True
    # redirect to affiliate URL
    # perform redirect regardless; only clicks from non-bot UAs are logged
    return HttpResponseRedirect(product.affiliate_url)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def affiliate_stats(request, pk):
    """Return daily click counts for the past N days (default 30)."""
    days = int(request.query_params.get('days', 30))
    # compute date range
    from django.utils import timezone
    end = timezone.now()
    start = end - timezone.timedelta(days=days-1)

    qs = AffiliateClick.objects.filter(product_id=pk, created_at__date__gte=start.date()).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id')).order_by('day')
    # build map for days
    data = {item['day'].isoformat(): item['count'] for item in qs}
    # fill missing days
    result = []
    cur = start.date()
    while cur <= end.date():
        result.append({'date': cur.isoformat(), 'count': data.get(cur.isoformat(), 0)})
        cur = cur + timezone.timedelta(days=1)
    return Response(result)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_donation_session(request):
    """Create a Stripe Checkout session for a one-off donation. Expects JSON { amount_cents: int }."""
    if not stripe:
        return Response({'detail': 'Payment gateway not configured'}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data
    try:
        amount = int(data.get('amount_cents', 0))
    except Exception:
        return Response({'detail': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

    if amount <= 0:
        return Response({'detail': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

    domain = request.build_absolute_uri('/')[:-1]
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Donation',
                        'description': 'Support the site and content',
                    },
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=domain + '/?donation=success',
            cancel_url=domain + '/?donation=cancel',
        )
        # record pending donation for later webhook reconciliation
        try:
            Donation.objects.create(amount_cents=amount, currency='usd', stripe_session_id=session.id, status='pending', metadata=data.get('metadata') or {})
        except Exception:
            # non-fatal: continue even if DB record cannot be created
            pass
        return Response({'checkout_url': session.url, 'stripe_session_id': session.id})
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def donate_webhook(request):
    """Stripe webhook endpoint to reconcile donation payments. Configure STRIPE_WEBHOOK_SECRET in env to verify signature."""
    if not stripe:
        return Response({'detail': 'Stripe not configured'}, status=status.HTTP_400_BAD_REQUEST)

    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE') or request.headers.get('Stripe-Signature')
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET') or getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
    event = None
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            # best effort: parse without signature validation (not recommended for production)
            event = stripe.Event.construct_from(request.data, stripe.api_key)
    except Exception as e:
        return Response({'detail': 'Webhook signature verification failed' if webhook_secret else str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # handle checkout.session.completed
    if event and event.get('type') == 'checkout.session.completed':
        sess = event['data']['object']
        sess_id = sess.get('id')
        amount_total = sess.get('amount_total') or sess.get('amount_subtotal')
        email = None
        if sess.get('customer_details'):
            email = sess['customer_details'].get('email')
        # mark matching Donation as succeeded
        try:
            d = None
            if sess_id:
                d = Donation.objects.filter(stripe_session_id=sess_id).first()
            if d:
                d.status = 'succeeded'
                if amount_total: d.amount_cents = int(amount_total)
                if email: d.email = email
                d.save()
            else:
                # create record if missing
                Donation.objects.create(amount_cents=int(amount_total or 0), currency='usd', stripe_session_id=sess_id, status='succeeded', email=email)
        except Exception:
            # swallow errors to ensure webhook returns 200 to Stripe to avoid retries
            pass

    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_paypal_order(request):
    """Create a PayPal order and return approval link. Requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in env.
    Returns {'approve_url': '...', 'order_id': '...'} or 400 with detail when not configured."""
    client_id = os.environ.get('PAYPAL_CLIENT_ID')
    client_secret = os.environ.get('PAYPAL_CLIENT_SECRET')
    mode = os.environ.get('PAYPAL_MODE', 'sandbox')
    if not client_id or not client_secret:
        return Response({'detail': 'PayPal not configured'}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data
    try:
        amount = int(data.get('amount_cents', 0))
    except Exception:
        return Response({'detail': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
    if amount <= 0:
        return Response({'detail': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

    # get access token
    token_url = 'https://api-m.paypal.com/v1/oauth2/token' if mode == 'live' else 'https://api-m.sandbox.paypal.com/v1/oauth2/token'
    try:
        resp = requests.post(token_url, data={'grant_type': 'client_credentials'}, auth=(client_id, client_secret), timeout=10)
        resp.raise_for_status()
        token = resp.json().get('access_token')
    except Exception as e:
        return Response({'detail': 'Could not get PayPal token: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # create order
    orders_url = 'https://api-m.paypal.com/v2/checkout/orders' if mode == 'live' else 'https://api-m.sandbox.paypal.com/v2/checkout/orders'
    order_payload = {
        'intent': 'CAPTURE',
        'purchase_units': [{
            'amount': {
                'currency_code': 'USD',
                'value': f"{amount/100:.2f}"
            }
        }],
        'application_context': {
            'return_url': request.build_absolute_uri('/'),
            'cancel_url': request.build_absolute_uri('/'),
        }
    }
    try:
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
        r = requests.post(orders_url, json=order_payload, headers=headers, timeout=10)
        r.raise_for_status()
        j = r.json()
        order_id = j.get('id')
        approve_link = None
        for link in j.get('links', []):
            if link.get('rel') == 'approve':
                approve_link = link.get('href')
                break
        # record pending donation with paypal_txn_id = order_id
        try:
            Donation.objects.create(amount_cents=amount, currency='usd', paypal_txn_id=order_id, status='pending')
        except Exception:
            pass
        return Response({'approve_url': approve_link, 'order_id': order_id})
    except Exception as e:
        return Response({'detail': 'Could not create PayPal order: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def paypal_webhook(request):
    """Basic PayPal webhook listener. For production, verify the webhook signature using PayPal Verify API."""
    # best-effort: parse payload and update Donation with matching order id
    try:
        event = request.data
    except Exception:
        return Response({'detail': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)

    event_type = event.get('event_type')
    resource = event.get('resource') or {}
    # PayPal capture event
    if event_type in ('CHECKOUT.ORDER.APPROVED', 'PAYMENT.CAPTURE.COMPLETED'):
        order_id = resource.get('id') or resource.get('supplementary_data', {}).get('related_ids', {}).get('order_id')
        # For capture events, resource may include 'supplementary_data' with related_ids
        if not order_id:
            # try nested fields
            order_id = resource.get('invoice_id') or resource.get('parent_payment')
        if order_id:
            try:
                d = Donation.objects.filter(paypal_txn_id=order_id).first()
                if d:
                    d.status = 'succeeded'
                    # attempt to capture payer email
                    payer = resource.get('payer') or resource.get('payer_info') or {}
                    email = payer.get('email_address') or payer.get('email')
                    if email:
                        d.email = email
                    d.save()
                else:
                    # create a record if missing
                    Donation.objects.create(amount_cents=int(float(resource.get('amount', {}).get('value', 0)) * 100), currency=resource.get('amount', {}).get('currency_code', 'usd'), paypal_txn_id=order_id, status='succeeded')
            except Exception:
                pass

    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def donation_report_csv(request):
    """Export donations as CSV for the given date range or default last 30 days."""
    import csv
    from django.utils import timezone
    days = int(request.query_params.get('days', 30))
    end = timezone.now()
    start = end - timezone.timedelta(days=days-1)
    qs = Donation.objects.filter(created_at__date__gte=start.date()).order_by('-created_at')
    filename = f"donations_{start.date().isoformat()}_to_{end.date().isoformat()}.csv"
    resp = HttpResponse(content_type='text/csv')
    resp['Content-Disposition'] = f'attachment; filename="{filename}"'
    writer = csv.writer(resp)
    writer.writerow(['created_at', 'amount_cents', 'currency', 'status', 'stripe_session_id', 'paypal_txn_id', 'email'])
    for d in qs:
        writer.writerow([d.created_at.isoformat(), d.amount_cents, d.currency, d.status, d.stripe_session_id or '', d.paypal_txn_id or '', d.email or ''])
    return resp


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def affiliate_clicks_csv(request, pk):
    """Export affiliate clicks as CSV for a product (authenticated)."""
    import csv
    from django.utils import timezone
    qs = AffiliateClick.objects.filter(product_id=pk).order_by('-created_at')
    filename = f"affiliate_clicks_product_{pk}.csv"
    resp = HttpResponse(content_type='text/csv')
    resp['Content-Disposition'] = f'attachment; filename="{filename}"'
    writer = csv.writer(resp)
    writer.writerow(['created_at', 'ip', 'user_agent', 'referer'])
    for c in qs:
        writer.writerow([c.created_at.isoformat(), c.ip or '', c.user_agent or '', c.referer or ''])
    return resp
