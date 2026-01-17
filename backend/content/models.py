from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Tag(models.Model):
    name = models.CharField(max_length=80, unique=True)

    def __str__(self):
        return self.name


class Portfolio(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=210, unique=True, blank=True)
    excerpt = models.CharField(max_length=400, blank=True)
    body = models.TextField(blank=True)
    cover = models.ImageField(upload_to='portfolio/covers/', blank=True, null=True)
    live_url = models.URLField(max_length=500, blank=True, help_text='URL to view the project live')
    github_url = models.URLField(max_length=500, blank=True, help_text='URL to view the project on GitHub')
    # structured tags using a Tag model for better filtering
    tags = models.ManyToManyField(Tag, blank=True, related_name='portfolios')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:180]
            slug = base
            i = 1
            while Portfolio.objects.filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def tag_list(self):
        return [t.name for t in self.tags.all()]

class PortfolioImage(models.Model):
    # allow images to be uploaded before a portfolio is created; link later
    portfolio = models.ForeignKey(Portfolio, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to='portfolio/images/')
    alt = models.CharField(max_length=200, blank=True)

    def __str__(self):
        if self.portfolio:
            return f"Image for {self.portfolio.title}"
        if self.alt:
            return f"Image: {self.alt}"
        # portfolio may be null during uploads in the admin; provide a safe fallback
        return "Unlinked image"


class Product(models.Model):
    """Represents a digital product that can be attached to blog posts or sold standalone."""
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    price_cents = models.PositiveIntegerField(default=0, help_text='Price in cents (e.g. 1999 = $19.99)')
    cover = models.ImageField(upload_to='products/covers/', blank=True, null=True, help_text='Product cover/thumbnail image')
    file = models.FileField(upload_to='products/files/', blank=True, null=True)
    stripe_price_id = models.CharField(max_length=200, blank=True, null=True, help_text='Optional Stripe Price ID for hosted checkout')
    stripe_product_id = models.CharField(max_length=200, blank=True, null=True, help_text='Optional Stripe Product ID')
    affiliate_url = models.URLField(max_length=1000, blank=True, null=True, help_text='Optional external affiliate or vendor URL')
    youtube_url = models.URLField(max_length=1000, blank=True, null=True, help_text='Optional YouTube video URL for product demo')
    live_url = models.URLField(max_length=500, blank=True, help_text='URL to view the project live')
    github_url = models.URLField(max_length=500, blank=True, help_text='URL to view the project on GitHub')
    affiliate_clicks = models.PositiveIntegerField(default=0, help_text='Count of outbound affiliate clicks')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200]
            slug = base
            i = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def price_display(self):
        return f"${self.price_cents / 100:.2f}"


class AffiliateClick(models.Model):
    product = models.ForeignKey(Product, related_name='affiliate_clicks_log', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    ip = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    referer = models.CharField(max_length=2000, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Click for {self.product.title} at {self.created_at.isoformat()}"


class BlogPost(models.Model):
    title = models.CharField(max_length=220)
    slug = models.SlugField(max_length=230, unique=True, blank=True)
    excerpt = models.CharField(max_length=400, blank=True)
    body = models.TextField(blank=True)
    cover = models.ImageField(upload_to='blog/covers/', blank=True, null=True)
    products = models.ManyToManyField('Product', blank=True, related_name='blogposts')
    tags = models.ManyToManyField(Tag, blank=True, related_name='blogposts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200]
            slug = base
            i = 1
            while BlogPost.objects.filter(slug=slug).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ContactFile(models.Model):
    FILE_TYPES = (
        ('cv', 'CV'),
        ('cert', 'Certification'),
        ('other', 'Other'),
    )
    label = models.CharField(max_length=200, blank=True, null=True, help_text='Friendly label shown in downloads')
    file = models.FileField(upload_to='contact/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPES, default='other')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.label or self.file.name.split('/')[-1]


class Review(models.Model):
    """Customer reviews that can appear on the homepage. Reviews are created by visitors and require admin moderation to publish."""
    name = models.CharField(max_length=120)
    rating = models.PositiveSmallIntegerField(default=5)
    message = models.TextField()
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.SET_NULL, null=True, blank=True)
    is_published = models.BooleanField(default=False, help_text='Only published reviews appear in public APIs')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.rating}★"


class Donation(models.Model):
    """Record of a donation attempt or completed donation from Stripe or PayPal."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
    ]

    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=10, default='usd')
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    paypal_txn_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    email = models.EmailField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        amt = f"${self.amount_cents/100:.2f}"
        return f"Donation {amt} ({self.status})"


class Service(models.Model):
    """Services offered by the portfolio owner."""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Emoji or icon identifier')
    order = models.PositiveIntegerField(default=0, help_text='Display order (lower numbers first)')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'title']

    def __str__(self):
        return self.title


class Skill(models.Model):
    """Skills and technologies."""
    name = models.CharField(max_length=100, unique=True)
    percent = models.PositiveIntegerField(default=0, help_text='Proficiency percentage (0-100)')
    icon = models.CharField(max_length=50, blank=True, help_text='Icon identifier for display')
    order = models.PositiveIntegerField(default=0, help_text='Display order (lower numbers first)')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} ({self.percent}%)"


class CV(models.Model):
    """Curriculum Vitae - only one active CV should exist."""
    file = models.FileField(upload_to='resources/cv/', help_text='PDF file of your CV')
    title = models.CharField(max_length=200, default='CV', help_text='Display title (e.g., "My CV" or "Resume")')
    is_active = models.BooleanField(default=True, help_text='Only the active CV will be displayed')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_active', '-uploaded_at']
        verbose_name = 'CV'
        verbose_name_plural = 'CVs'

    def __str__(self):
        return f"{self.title} ({'Active' if self.is_active else 'Inactive'})"

    def save(self, *args, **kwargs):
        # Ensure only one active CV at a time
        if self.is_active:
            CV.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)


class Certification(models.Model):
    """Professional certifications - multiple certifications allowed."""
    file = models.FileField(upload_to='resources/certifications/', help_text='PDF file of the certification')
    title = models.CharField(max_length=200, help_text='Certification name (e.g., "AWS Certified Solutions Architect")')
    issuer = models.CharField(max_length=200, blank=True, help_text='Issuing organization')
    issue_date = models.DateField(blank=True, null=True, help_text='Date when certification was issued')
    expiry_date = models.DateField(blank=True, null=True, help_text='Expiry date (if applicable)')
    is_published = models.BooleanField(default=True, help_text='Only published certifications will be displayed')
    order = models.PositiveIntegerField(default=0, help_text='Display order (lower numbers first)')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-issue_date', 'title']
        verbose_name = 'Certification'
        verbose_name_plural = 'Certifications'

    def __str__(self):
        return self.title


class About(models.Model):
    """About page content - single instance model for managing about page."""
    name = models.CharField(max_length=200, help_text='Your full name')
    title = models.CharField(max_length=200, help_text='Your professional title (e.g., "Full Stack Developer")')
    profile_image = models.ImageField(upload_to='about/', blank=True, null=True, help_text='Your profile picture')
    bio = models.TextField(help_text='Short bio/introduction')
    long_description = models.TextField(blank=True, help_text='Detailed about section')
    location = models.CharField(max_length=200, blank=True, help_text='Your location (e.g., "New York, NY")')
    email = models.EmailField(blank=True, help_text='Contact email')
    website = models.URLField(blank=True, help_text='Personal website URL')
    linkedin_url = models.URLField(blank=True, help_text='LinkedIn profile URL')
    github_url = models.URLField(blank=True, help_text='GitHub profile URL')
    twitter_url = models.URLField(blank=True, help_text='Twitter/X profile URL')
    resume_url = models.URLField(blank=True, help_text='Link to resume/CV')
    is_published = models.BooleanField(default=True, help_text='Publish the about page')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'About Page'
        verbose_name_plural = 'About Page'
        ordering = ['-updated_at']

    def __str__(self):
        return f"About: {self.name}"

    def save(self, *args, **kwargs):
        # Ensure only one About instance exists
        if not self.pk:
            About.objects.all().delete()
        super().save(*args, **kwargs)


class DonationInfo(models.Model):
    """Donation information including mobile money and bank details."""
    mtn_mobile_money = models.CharField(max_length=20, blank=True, help_text='MTN Mobile Money number')
    orange_money = models.CharField(max_length=20, blank=True, help_text='Orange Money number')
    card_number = models.CharField(max_length=50, blank=True, help_text='Card number for donations')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Donation Information"
        verbose_name_plural = "Donation Information"

    def __str__(self):
        return "Donation Information"

    def save(self, *args, **kwargs):
        # Ensure only one DonationInfo instance exists
        if not self.pk and DonationInfo.objects.exists():
            # Update existing instead of creating new
            existing = DonationInfo.objects.first()
            self.pk = existing.pk
        super().save(*args, **kwargs)


class BankDetail(models.Model):
    """Bank account details for donations."""
    donation_info = models.ForeignKey(DonationInfo, related_name='banks', on_delete=models.CASCADE)
    bank_name = models.CharField(max_length=200, help_text='Name of the bank')
    account_name = models.CharField(max_length=200, help_text='Account holder name')
    account_number = models.CharField(max_length=50, help_text='Account number')
    swift_code = models.CharField(max_length=20, blank=True, help_text='SWIFT/BIC code (if applicable)')
    branch = models.CharField(max_length=200, blank=True, help_text='Branch name/location')
    order = models.PositiveIntegerField(default=0, help_text='Display order')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'bank_name']
        verbose_name = "Bank Detail"
        verbose_name_plural = "Bank Details"

    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


class GiftCard(models.Model):
    """Uploaded gift cards from donors."""
    card_image = models.ImageField(upload_to='donations/gift_cards/', help_text='Uploaded gift card image')
    donor_name = models.CharField(max_length=200, blank=True, help_text='Name of the donor (optional)')
    donor_email = models.EmailField(blank=True, help_text='Email of the donor (optional)')
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text='Gift card amount (if known)')
    notes = models.TextField(blank=True, help_text='Additional notes')
    is_processed = models.BooleanField(default=False, help_text='Mark as processed when redeemed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Gift Card"
        verbose_name_plural = "Gift Cards"

    def __str__(self):
        return f"Gift Card from {self.donor_name or 'Anonymous'} - {self.created_at.strftime('%Y-%m-%d')}"


class Hero(models.Model):
    """Hero section content - single instance model for managing hero section."""
    greeting = models.CharField(max_length=200, default='Hi — I design & operate cloud-first apps', help_text='Greeting text (e.g., "Hi — I design & operate cloud-first apps")')
    typing_prefix = models.CharField(max_length=50, default='I am', help_text='Text before typing animation (e.g., "I am")')
    typing_strings = models.TextField(default='Cloud Engineer\nWeb Developer\nGraphics & Logo Designer', help_text='Comma or newline-separated list of strings for typing animation')
    main_title = models.CharField(max_length=300, default='Building Cloud-Powered Digital Experiences That Scale', help_text='Main hero title')
    button1_text = models.CharField(max_length=100, default='Hire me', help_text='First button text')
    button1_link = models.CharField(max_length=200, default='#contact', help_text='First button link (e.g., "#contact" or "/contact")')
    button2_text = models.CharField(max_length=100, default='View portfolio', help_text='Second button text')
    button2_link = models.CharField(max_length=200, default='/portfolio', help_text='Second button link')
    background_video = models.FileField(upload_to='hero/', blank=True, null=True, help_text='Background video file (MP4)')
    background_image = models.ImageField(upload_to='hero/', blank=True, null=True, help_text='Background image (fallback if no video)')
    scroll_text = models.CharField(max_length=200, default='Scroll to explore', blank=True, help_text='Text at bottom of hero')
    is_published = models.BooleanField(default=True, help_text='Publish the hero section')
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Hero Section'
        verbose_name_plural = 'Hero Section'
        ordering = ['-updated_at']

    def __str__(self):
        return f"Hero: {self.main_title[:50]}"

    def save(self, *args, **kwargs):
        # Ensure only one Hero instance exists
        if not self.pk:
            Hero.objects.all().delete()
        super().save(*args, **kwargs)