from django.contrib import admin
from django.utils.html import format_html
from .models import Portfolio, PortfolioImage
from .models import Tag, Product, BlogPost, AffiliateClick, Review, Donation, ContactFile, Service, Skill, CV, Certification, About, Hero, DonationInfo, BankDetail, GiftCard


# Custom admin site configuration
admin.site.site_header = "Tech with Ndimih - Admin Dashboard"
admin.site.site_title = "Admin Portal"
admin.site.index_title = "Welcome to Management Dashboard"


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'get_links', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('created_at', 'tags')
    search_fields = ('title', 'excerpt', 'body')
    ordering = ('-created_at',)
    fieldsets = (
        ('📋 Project Information', {
            'fields': ('title', 'slug', 'excerpt', 'body')
        }),
        ('🖼️ Media', {
            'fields': ('cover',)
        }),
        ('🔗 Links', {
            'fields': ('live_url', 'github_url')
        }),
        ('🏷️ Tags', {
            'fields': ('tags',)
        }),
    )
    
    def get_links(self, obj):
        links = []
        if obj.live_url:
            links.append(f'<a href="{obj.live_url}" target="_blank">🌐 Live</a>')
        if obj.github_url:
            links.append(f'<a href="{obj.github_url}" target="_blank">💻 Code</a>')
        return format_html(' | '.join(links)) if links else '-'
    get_links.short_description = 'Project Links'


@admin.register(PortfolioImage)
class PortfolioImageAdmin(admin.ModelAdmin):
    list_display = ('portfolio', 'get_image_preview')
    list_filter = ('portfolio',)
    search_fields = ('portfolio__title',)
    
    def get_image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="border-radius: 4px;" />', obj.image.url)
        return '-'
    get_image_preview.short_description = '📸 Preview'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_usage_count')
    search_fields = ('name',)
    ordering = ('name',)
    
    def get_usage_count(self, obj):
        count = obj.portfolio_set.count()
        return format_html('<span style="background: #e8f4f8; padding: 4px 8px; border-radius: 3px;">{} projects</span>', count)
    get_usage_count.short_description = '📊 Used In'

from .models import Product, BlogPost, AffiliateClick


class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_price', 'affiliate_clicks', 'is_published')
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('is_published',)
    search_fields = ('title', 'description')
    list_editable = ('is_published',)
    fieldsets = (
        ('📦 Product Information', {
            'fields': ('title', 'slug', 'description', 'is_published')
        }),
        ('💰 Pricing', {
            'fields': ('price_cents',)
        }),
        ('🔗 Links & Files', {
            'fields': ('affiliate_url', 'file', 'stripe_product_id', 'stripe_price_id')
        }),
    )
    
    def get_price(self, obj):
        price = obj.price_cents / 100 if obj.price_cents else 0
        return format_html('<span style="color: #28a745; font-weight: bold;">${:.2f}</span>', price)
    get_price.short_description = '💵 Price'


@admin.register(AffiliateClick)
class AffiliateClickAdmin(admin.ModelAdmin):
    list_display = ('product', 'get_ip_shortened', 'get_user_agent', 'created_at')
    list_filter = ('product', 'created_at')
    search_fields = ('ip', 'user_agent', 'referer')
    readonly_fields = ('product', 'ip', 'user_agent', 'referer', 'created_at')
    date_hierarchy = 'created_at'
    
    def get_ip_shortened(self, obj):
        return format_html('<code style="background: #f0f0f0; padding: 3px 6px; border-radius: 3px;">{}</code>', obj.ip)
    get_ip_shortened.short_description = '🌐 IP Address'
    
    def get_user_agent(self, obj):
        ua = obj.user_agent[:40] + '...' if len(obj.user_agent) > 40 else obj.user_agent
        return ua
    get_user_agent.short_description = '🔧 User Agent'
    
    def has_add_permission(self, request):
        return False


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'get_product_count', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    list_filter = ('created_at',)
    search_fields = ('title', 'excerpt', 'body')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('📝 Post Information', {
            'fields': ('title', 'slug', 'excerpt', 'body', 'cover')
        }),
        ('📦 Associated Products', {
            'fields': ('products',)
        }),
        ('🏷️ Tags', {
            'fields': ('tags',)
        }),
        ('⏰ Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_product_count(self, obj):
        count = obj.products.count()
        return format_html('<span style="background: #ffeaa7; padding: 4px 8px; border-radius: 3px;">{} products</span>', count)
    get_product_count.short_description = '📦 Products'


@admin.register(Product)
class ProductAdminReg(ProductAdmin):
    pass


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'get_status', 'created_at')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'description')
    list_editable = ('order',)
    ordering = ('order',)
    fieldsets = (
        ('🛠️ Service Details', {
            'fields': ('title', 'description', 'icon')
        }),
        ('📋 Organization', {
            'fields': ('order',)
        }),
        ('📢 Publishing', {
            'fields': ('is_published',)
        }),
    )
    
    def get_status(self, obj):
        if obj.is_published:
            return format_html('<span style="background: #81c784; color: white; padding: 4px 8px; border-radius: 3px;">✓ Published</span>')
        return format_html('<span style="background: #ef5350; color: white; padding: 4px 8px; border-radius: 3px;">✕ Draft</span>')
    get_status.short_description = '📢 Status'


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_proficiency', 'order', 'get_status')
    list_filter = ('is_published', 'percent')
    search_fields = ('name', 'icon')
    list_editable = ('order',)
    ordering = ('order',)
    fieldsets = (
        ('💡 Skill Information', {
            'fields': ('name', 'icon', 'percent')
        }),
        ('📋 Organization', {
            'fields': ('order',)
        }),
        ('📢 Publishing', {
            'fields': ('is_published',)
        }),
    )
    
    def get_proficiency(self, obj):
        return format_html(
            '<div style="background: #e0e0e0; border-radius: 3px; overflow: hidden; width: 100px; height: 20px;">'
            '<div style="background: #2196f3; height: 100%; width: {}%;" title="{}%"></div></div>',
            obj.percent, obj.percent
        )
    get_proficiency.short_description = '📊 Proficiency'
    
    def get_status(self, obj):
        if obj.is_published:
            return format_html('<span style="background: #81c784; color: white; padding: 4px 8px; border-radius: 3px;">✓ Active</span>')
        return format_html('<span style="background: #ef5350; color: white; padding: 4px 8px; border-radius: 3px;">✕ Inactive</span>')
    get_status.short_description = '📢 Status'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_rating_stars', 'product', 'get_status', 'created_at')
    list_filter = ('rating', 'created_at', 'is_published')
    search_fields = ('name', 'message')
    readonly_fields = ('created_at', 'get_rating_display')
    fieldsets = (
        ('👤 Reviewer Info', {
            'fields': ('name', 'message')
        }),
        ('⭐ Rating', {
            'fields': ('rating', 'get_rating_display')
        }),
        ('📦 Product', {
            'fields': ('product',)
        }),
        ('📢 Publishing', {
            'fields': ('is_published',)
        }),
        ('⏰ Created', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_rating_stars(self, obj):
        stars = '⭐' * int(obj.rating)
        return format_html('{} <span style="color: #666;">({})</span>', stars, obj.rating)
    get_rating_stars.short_description = '⭐ Rating'
    
    def get_rating_display(self, obj):
        stars = '⭐' * int(obj.rating)
        return format_html('{} / 5.0', stars)
    get_rating_display.short_description = '⭐ Rating Display'
    
    def get_status(self, obj):
        if obj.is_published:
            return format_html('<span style="background: #81c784; color: white; padding: 4px 8px; border-radius: 3px;">✓ Published</span>')
        return format_html('<span style="background: #ffa726; color: white; padding: 4px 8px; border-radius: 3px;">⏱ Draft</span>')
    get_status.short_description = '📢 Status'


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('get_transaction_id', 'get_amount', 'get_payment_status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('stripe_session_id', 'paypal_txn_id', 'email')
    readonly_fields = ('created_at', 'get_amount_formatted')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('💰 Donation Details', {
            'fields': ('amount_cents', 'currency', 'get_amount_formatted')
        }),
        ('💳 Payment Information', {
            'fields': ('stripe_session_id', 'paypal_txn_id', 'status')
        }),
        ('📧 Contact', {
            'fields': ('email',)
        }),
        ('📝 Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('⏰ Created', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_transaction_id(self, obj):
        txn_id = obj.stripe_session_id or obj.paypal_txn_id or 'N/A'
        return format_html('<code style="background: #f5f5f5; padding: 4px 6px; border-radius: 3px; font-size: 11px;">{}</code>', txn_id[:20])
    get_transaction_id.short_description = '💳 Transaction'
    
    def get_amount(self, obj):
        color = '#2196f3'
        amount = obj.amount_cents / 100
        currency = obj.currency.upper() or 'USD'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} {:.2f}</span>',
            color, currency, amount
        )
    get_amount.short_description = '💰 Amount'
    
    def get_amount_formatted(self, obj):
        amount = obj.amount_cents / 100
        currency = obj.currency.upper() or 'USD'
        return f'{currency} {amount:.2f}'
    get_amount_formatted.short_description = '💰 Amount'
    
    def get_payment_status(self, obj):
        status_colors = {
            'pending': '#ffa726',
            'succeeded': '#81c784',
            'failed': '#ef5350',
        }
        status_icons = {
            'pending': '⏱',
            'succeeded': '✓',
            'failed': '✕',
        }
        bg_color = status_colors.get(obj.status, '#999')
        icon = status_icons.get(obj.status, '?')
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 3px;">{} {}</span>',
            bg_color, icon, obj.get_status_display()
        )
    get_payment_status.short_description = '💳 Status'


@admin.register(ContactFile)
class ContactFileAdmin(admin.ModelAdmin):
    list_display = ('label', 'file_type', 'get_file_name', 'get_file_size', 'created_at')
    list_filter = ('created_at', 'file_type')
    search_fields = ('label',)
    readonly_fields = ('created_at', 'get_file_info')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('📎 File Details', {
            'fields': ('label', 'file', 'file_type')
        }),
        ('📋 File Information', {
            'fields': ('get_file_info',)
        }),
        ('⏰ Created', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return '—'
    get_file_name.short_description = '📎 Filename'
    
    def get_file_size(self, obj):
        if obj.file:
            size = obj.file.size
            if size < 1024:
                return format_html('<span style="color: #666;">{} B</span>', size)
            elif size < 1024 * 1024:
                return format_html('<span style="color: #666;">{:.1f} KB</span>', size / 1024)
            else:
                return format_html('<span style="color: #666;">{:.1f} MB</span>', size / (1024 * 1024))
        return '—'
    get_file_size.short_description = '📏 Size'
    
    def get_file_info(self, obj):
        if obj.file:
            size = obj.file.size
            if size < 1024:
                size_str = f'{size} B'
            elif size < 1024 * 1024:
                size_str = f'{size / 1024:.1f} KB'
            else:
                size_str = f'{size / (1024 * 1024):.1f} MB'
            return format_html(
                '<div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace;">'
                '<p><strong>Name:</strong> {}</p>'
                '<p><strong>Size:</strong> {}</p>'
                '<p><strong>Type:</strong> {}</p>'
                '</div>',
                obj.file.name, size_str, obj.get_file_type_display()
            )
        return 'No file attached'
    get_file_info.short_description = '📄 File Information'


@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'get_status', 'uploaded_at', 'updated_at')
    list_filter = ('is_active', 'uploaded_at')
    search_fields = ('title',)
    list_editable = ('is_active',)
    readonly_fields = ('uploaded_at', 'updated_at')
    fieldsets = (
        ('📄 Document', {
            'fields': ('title', 'file', 'is_active')
        }),
        ('⏰ Timestamps', {
            'fields': ('uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_status(self, obj):
        if obj.is_active:
            return format_html('<span style="background: #81c784; color: white; padding: 4px 8px; border-radius: 3px;">✓ Active</span>')
        return format_html('<span style="background: #ef5350; color: white; padding: 4px 8px; border-radius: 3px;">✕ Inactive</span>')
    get_status.short_description = '📢 Status'


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'issuer', 'get_date_range', 'get_status', 'order')
    list_filter = ('is_published', 'issue_date', 'uploaded_at')
    search_fields = ('title', 'issuer')
    list_editable = ('order',)
    date_hierarchy = 'issue_date'
    readonly_fields = ('uploaded_at', 'updated_at')
    fieldsets = (
        ('📜 Certification Details', {
            'fields': ('title', 'issuer', 'credential_id', 'credential_url')
        }),
        ('📅 Dates', {
            'fields': ('issue_date', 'expiry_date')
        }),
        ('🖼️ Media', {
            'fields': ('image',)
        }),
        ('📋 Organization', {
            'fields': ('order',)
        }),
        ('📢 Publishing', {
            'fields': ('is_published',)
        }),
        ('⏰ Timestamps', {
            'fields': ('uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_date_range(self, obj):
        if obj.expiry_date:
            return format_html(
                '<span style="color: #666;">{} → {}</span>',
                obj.issue_date.strftime('%Y'), obj.expiry_date.strftime('%Y')
            )
        return obj.issue_date.strftime('%Y')
    get_date_range.short_description = '📅 Period'
    
    def get_status(self, obj):
        if obj.is_published:
            return format_html('<span style="background: #81c784; color: white; padding: 4px 8px; border-radius: 3px;">✓ Published</span>')
        return format_html('<span style="background: #ffa726; color: white; padding: 4px 8px; border-radius: 3px;">⏱ Draft</span>')
    get_status.short_description = '📢 Status'


@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    list_display = ('name', 'title', 'location', 'is_published', 'get_status', 'updated_at')
    list_editable = ('is_published',)
    list_filter = ('is_published',)
    search_fields = ('name', 'title', 'bio', 'location')
    readonly_fields = ('updated_at', 'created_at')
    fieldsets = (
        ('👤 Basic Information', {
            'fields': ('name', 'title', 'profile_image', 'bio', 'long_description', 'location')
        }),
        ('🔗 Contact & Social Links', {
            'fields': ('email', 'website', 'linkedin_url', 'github_url', 'twitter_url', 'resume_url')
        }),
        ('📢 Publishing', {
            'fields': ('is_published',)
        }),
        ('⏰ Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_status(self, obj):
        if obj.is_published:
            return format_html('<span style="background: #81c784; color: white; padding: 4px 8px; border-radius: 3px;">✓ Published</span>')
        return format_html('<span style="background: #ffa726; color: white; padding: 4px 8px; border-radius: 3px;">⏱ Draft</span>')
    get_status.short_description = '📢 Status'


@admin.register(DonationInfo)
class DonationInfoAdmin(admin.ModelAdmin):
    list_display = ('get_payment_methods', 'is_active', 'get_status', 'updated_at')
    list_editable = ('is_active',)
    readonly_fields = ('updated_at',)
    fieldsets = (
        ('📱 Mobile Money', {
            'fields': ('mtn_mobile_money', 'orange_money')
        }),
        ('💳 Card', {
            'fields': ('card_number',)
        }),
        ('📢 Status', {
            'fields': ('is_active',)
        }),
        ('⏰ Timestamps', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_payment_methods(self, obj):
        methods = []
        if obj.mtn_mobile_money:
            methods.append('📱 MTN')
        if obj.orange_money:
            methods.append('📱 Orange')
        if obj.card_number:
            methods.append('💳 Card')
        return format_html(', '.join(methods)) if methods else '-'
    get_payment_methods.short_description = '💰 Payment Methods'
    
    def get_status(self, obj):
        if obj.is_active:
            return format_html('<span style="background: #81c784; color: white; padding: 4px 8px; border-radius: 3px;">✓ Active</span>')
        return format_html('<span style="background: #ef5350; color: white; padding: 4px 8px; border-radius: 3px;">✕ Inactive</span>')
    get_status.short_description = '📢 Status'


@admin.register(BankDetail)
class BankDetailAdmin(admin.ModelAdmin):
    list_display = ('bank_name', 'account_name', 'get_account_masked', 'order')
    list_editable = ('order',)
    list_filter = ('donation_info',)
    search_fields = ('bank_name', 'account_name', 'account_number')
    readonly_fields = ('updated_at',)
    fieldsets = (
        ('🏦 Bank Information', {
            'fields': ('donation_info', 'bank_name', 'account_name', 'account_number')
        }),
        ('🔐 Additional Info', {
            'fields': ('swift_code', 'branch')
        }),
        ('📋 Organization', {
            'fields': ('order',)
        }),
        ('⏰ Timestamps', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_account_masked(self, obj):
        if obj.account_number:
            masked = obj.account_number[-4:].rjust(len(obj.account_number), '*')
            return format_html('<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px;">{}</code>', masked)
        return '-'
    get_account_masked.short_description = '🔐 Account #'


@admin.register(GiftCard)
class GiftCardAdmin(admin.ModelAdmin):
    list_display = ('donor_name', 'donor_email', 'get_amount', 'is_processed', 'get_status', 'created_at')
    list_filter = ('is_processed', 'created_at')
    list_editable = ('is_processed',)
    search_fields = ('donor_name', 'donor_email', 'notes')
    readonly_fields = ('created_at', 'updated_at', 'get_image_preview')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('🎁 Gift Card Details', {
            'fields': ('card_image', 'get_image_preview')
        }),
        ('👤 Donor Information', {
            'fields': ('donor_name', 'donor_email')
        }),
        ('💰 Amount', {
            'fields': ('amount',)
        }),
        ('💬 Notes', {
            'fields': ('notes',)
        }),
        ('📢 Processing', {
            'fields': ('is_processed',)
        }),
        ('⏰ Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_amount(self, obj):
        return format_html('<span style="color: #2196f3; font-weight: bold;">${:.2f}</span>', obj.amount)
    get_amount.short_description = '💰 Amount'
    
    def get_status(self, obj):
        if obj.is_processed:
            return format_html('<span style="background: #81c784; color: white; padding: 4px 8px; border-radius: 3px;">✓ Processed</span>')
        return format_html('<span style="background: #ffa726; color: white; padding: 4px 8px; border-radius: 3px;">⏱ Pending</span>')
    get_status.short_description = '📢 Status'
    
    def get_image_preview(self, obj):
        if obj.card_image:
            return format_html(
                '<img src="{}" style="max-width: 300px; height: auto; border-radius: 8px; border: 1px solid #ddd;" />',
                obj.card_image.url
            )
        return 'No image'
    get_image_preview.short_description = '🖼️ Preview'


@admin.register(Hero)
class HeroAdmin(admin.ModelAdmin):
    list_display = ('main_title', 'is_published', 'get_status', 'updated_at')
    list_editable = ('is_published',)
    list_filter = ('is_published',)
    search_fields = ('main_title', 'greeting', 'button1_text', 'button2_text')
    readonly_fields = ('updated_at',)
    fieldsets = (
        ('📝 Text Content', {
            'fields': ('greeting', 'typing_prefix', 'typing_strings', 'main_title', 'scroll_text')
        }),
        ('🔘 Buttons', {
            'fields': ('button1_text', 'button1_link', 'button2_text', 'button2_link')
        }),
        ('🎬 Background Media', {
            'fields': ('background_video', 'background_image'),
            'description': 'Upload a video (MP4) or image for the hero background. Video takes priority if both are provided.'
        }),
        ('📢 Publishing', {
            'fields': ('is_published',)
        }),
        ('⏰ Timestamps', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_status(self, obj):
        if obj.is_published:
            return format_html('<span style="background: #81c784; color: white; padding: 4px 8px; border-radius: 3px;">✓ Published</span>')
        return format_html('<span style="background: #ffa726; color: white; padding: 4px 8px; border-radius: 3px;">⏱ Draft</span>')
    get_status.short_description = '📢 Status'
