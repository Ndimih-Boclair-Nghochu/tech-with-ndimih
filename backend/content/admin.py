from django.contrib import admin
from .models import Portfolio, PortfolioImage
from .models import Tag, Product, BlogPost, AffiliateClick, Review, Donation, ContactFile, Service, Skill, CV, Certification, About, Hero, DonationInfo, BankDetail, GiftCard


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'excerpt', 'body')
        }),
        ('Media', {
            'fields': ('cover',)
        }),
        ('Links', {
            'fields': ('live_url', 'github_url')
        }),
        ('Tags', {
            'fields': ('tags',)
        }),
    )


@admin.register(PortfolioImage)
class PortfolioImageAdmin(admin.ModelAdmin):
    list_display = ('portfolio', 'image')

from .models import Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)

from .models import Product, BlogPost, AffiliateClick
from .models import Review
from .models import Donation


class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'price_cents', 'affiliate_url', 'affiliate_clicks')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(AffiliateClick)
class AffiliateClickAdmin(admin.ModelAdmin):
    list_display = ('product', 'created_at', 'ip', 'user_agent', 'referer')
    list_filter = ('product', 'created_at')
    search_fields = ('ip', 'user_agent', 'referer')


class ProductInline(admin.TabularInline):
    model = BlogPost.products.through
    extra = 1


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProductInline]


@admin.register(Product)
class ProductAdminReg(ProductAdmin):
    pass


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'rating', 'product', 'is_published', 'created_at')
    list_filter = ('is_published', 'created_at')
    search_fields = ('name', 'message')
    list_editable = ('is_published',)
    readonly_fields = ('created_at',)
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of reviews - they are permanently stored"""
        return False
    
    def get_actions(self, request):
        """Remove delete action from admin"""
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('amount_cents', 'currency', 'status', 'email', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('stripe_session_id', 'paypal_txn_id', 'email')


@admin.register(ContactFile)
class ContactFileAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'file_type', 'created_at')
    list_filter = ('file_type', 'created_at')
    search_fields = ('label', 'file')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_published', 'created_at')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'description')
    list_editable = ('order', 'is_published')


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'percent', 'order', 'is_published', 'created_at')
    list_filter = ('is_published', 'created_at')
    search_fields = ('name',)
    list_editable = ('percent', 'order', 'is_published')


@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'uploaded_at', 'updated_at')
    list_filter = ('is_active', 'uploaded_at')
    search_fields = ('title',)
    list_editable = ('is_active',)


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'issuer', 'issue_date', 'expiry_date', 'is_published', 'order', 'uploaded_at')
    list_filter = ('is_published', 'issue_date', 'uploaded_at')
    search_fields = ('title', 'issuer')
    list_editable = ('is_published', 'order')
    date_hierarchy = 'issue_date'


@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'location', 'is_published', 'updated_at')
    list_editable = ('is_published',)
    list_filter = ('is_published',)
    search_fields = ('name', 'title', 'bio', 'location')
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'title', 'profile_image', 'bio', 'long_description', 'location')
        }),
        ('Contact & Social Links', {
            'fields': ('email', 'website', 'linkedin_url', 'github_url', 'twitter_url', 'resume_url')
        }),
        ('Publishing', {
            'fields': ('is_published',)
        }),
    )


@admin.register(DonationInfo)
class DonationInfoAdmin(admin.ModelAdmin):
    list_display = ('mtn_mobile_money', 'orange_money', 'card_number', 'is_active', 'updated_at')
    list_editable = ('is_active',)
    fieldsets = (
        ('Mobile Money', {
            'fields': ('mtn_mobile_money', 'orange_money')
        }),
        ('Card', {
            'fields': ('card_number',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(BankDetail)
class BankDetailAdmin(admin.ModelAdmin):
    list_display = ('bank_name', 'account_name', 'account_number', 'donation_info', 'order')
    list_editable = ('order',)
    list_filter = ('donation_info',)
    search_fields = ('bank_name', 'account_name', 'account_number')
    fieldsets = (
        (None, {
            'fields': ('donation_info', 'bank_name', 'account_name', 'account_number', 'order')
        }),
        ('Additional Info', {
            'fields': ('swift_code', 'branch')
        }),
    )


@admin.register(GiftCard)
class GiftCardAdmin(admin.ModelAdmin):
    list_display = ('donor_name', 'amount', 'is_processed', 'created_at')
    list_filter = ('is_processed', 'created_at')
    list_editable = ('is_processed',)
    search_fields = ('donor_name', 'donor_email', 'notes')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('card_image', 'donor_name', 'donor_email', 'amount', 'is_processed')
        }),
        ('Additional Info', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Hero)
class HeroAdmin(admin.ModelAdmin):
    list_display = ('main_title', 'is_published', 'updated_at')
    list_editable = ('is_published',)
    list_filter = ('is_published',)
    search_fields = ('main_title', 'greeting', 'button1_text', 'button2_text')
    fieldsets = (
        ('Text Content', {
            'fields': ('greeting', 'typing_prefix', 'typing_strings', 'main_title', 'scroll_text')
        }),
        ('Buttons', {
            'fields': ('button1_text', 'button1_link', 'button2_text', 'button2_link')
        }),
        ('Background Media', {
            'fields': ('background_video', 'background_image'),
            'description': 'Upload a video (MP4) or image for the hero background. Video takes priority if both are provided.'
        }),
        ('Publishing', {
            'fields': ('is_published',)
        }),
    )
