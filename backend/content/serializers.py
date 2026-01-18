from rest_framework import serializers
from .models import Portfolio, PortfolioImage, Tag, Product, BlogPost, Review
from .models import Donation, Service, Skill, CV, Certification, About, Hero, DonationInfo, BankDetail, GiftCard
from django.conf import settings
import os


class PortfolioImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioImage
        fields = ['id', 'image', 'alt']


class PortfolioSerializer(serializers.ModelSerializer):
    images = PortfolioImageSerializer(many=True, read_only=True)
    # accept tags as a list of strings or a comma-separated string on write
    # Make tags read-only in the field definition to avoid DRF trying to serialize ManyRelatedManager
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = ['id', 'title', 'slug', 'excerpt', 'body', 'cover', 'live_url', 'github_url', 'tags', 'created_at', 'images']
        read_only_fields = ['slug', 'created_at']

    def get_tags(self, obj):
        """Return tags as a list of names for read operations"""
        return [t.name for t in obj.tags.all()]

    def to_internal_value(self, data):
        """Handle tags input for write operations"""
        # Store tags for later processing in create/update
        tags_data = data.get('tags', [])
        # Remove tags from data so it doesn't interfere with model fields
        data = data.copy()
        if 'tags' in data:
            del data['tags']
        validated_data = super().to_internal_value(data)
        # Store tags separately for create/update methods
        validated_data['_tags'] = tags_data
        return validated_data

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Tags are already handled by get_tags method
        return ret

    def _normalize_tags(self, tags_val):
        # tags_val may be a list or a comma-separated string
        if tags_val is None:
            return []
        if isinstance(tags_val, str):
            parts = [p.strip() for p in tags_val.split(',') if p.strip()]
        else:
            parts = [str(p).strip() for p in tags_val if str(p).strip()]
        # normalize to lowercase names
        return [p.lower() for p in parts]

    def create(self, validated_data):
        tags_val = validated_data.pop('_tags', [])
        tags = self._normalize_tags(tags_val)
        portfolio = Portfolio.objects.create(**validated_data)
        for name in tags:
            tag_obj, _ = Tag.objects.get_or_create(name=name)
            portfolio.tags.add(tag_obj)
        return portfolio

    def update(self, instance, validated_data):
        tags_val = validated_data.pop('_tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags_val is not None:
            tags = self._normalize_tags(tags_val)
            instance.tags.clear()
            for name in tags:
                tag_obj, _ = Tag.objects.get_or_create(name=name)
                instance.tags.add(tag_obj)
        return instance


class ProductSerializer(serializers.ModelSerializer):
    whatsapp_url = serializers.URLField(required=False, allow_blank=True)
    live_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = ['id', 'title', 'slug', 'description', 'price_cents', 'cover', 'file', 'stripe_price_id', 'stripe_product_id', 'live_url', 'whatsapp_url', 'affiliate_clicks', 'is_published', 'created_at']

    def validate(self, attrs):
        # price validation
        price = attrs.get('price_cents', None)
        if price is not None and price < 0:
            raise serializers.ValidationError({'price_cents': 'Price must be non-negative'})

        # file validation
        f = attrs.get('file', None)
        if f:
            # determine max size (MB)
            max_mb = int(getattr(settings, 'MAX_PRODUCT_MB', 25))
            if f.size > max_mb * 1024 * 1024:
                raise serializers.ValidationError({'file': f'File too large (max {max_mb} MB)'})

            allowed_mimes = ['application/zip', 'application/x-zip-compressed', 'application/pdf', 'image/png', 'image/jpeg']
            # Some uploads may have generic content_type; fall back to extension check
            content_type = getattr(f, 'content_type', '') or ''
            name = getattr(f, 'name', '') or ''
            ext = os.path.splitext(name)[1].lower()
            allowed_exts = ['.zip', '.pdf', '.png', '.jpg', '.jpeg']
            if content_type not in allowed_mimes and ext not in allowed_exts:
                raise serializers.ValidationError({'file': 'Invalid file type. Allowed: zip, pdf, png, jpg'})

        return attrs


class BlogPostSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='products'
    )
    # Use SerializerMethodField for tags to avoid ManyRelatedManager iteration issues
    tags = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'body', 'cover', 'products', 'product_ids', 'tags', 'created_at']
        read_only_fields = ['slug', 'created_at']

    def get_tags(self, obj):
        """Return tags as a list of names for read operations"""
        return [t.name for t in obj.tags.all()]

    def to_internal_value(self, data):
        """Handle tags and products input for write operations"""
        # Extract tags from data
        tags_data = data.get('tags', [])
        # Extract products from data (allow both 'products' and 'product_ids')
        products_data = data.get('product_ids') or data.get('products', [])
        
        data = data.copy()
        if 'tags' in data:
            del data['tags']
        # Don't delete product_ids here - let the serializer handle it
        
        validated_data = super().to_internal_value(data)
        # Store tags and products for create/update
        validated_data['_tags'] = tags_data
        validated_data['_products'] = products_data
        return validated_data

    def create(self, validated_data):
        tags_data = validated_data.pop('_tags', [])
        products_data = validated_data.pop('_products', [])
        
        # Create the blog post
        blog_post = BlogPost.objects.create(**validated_data)
        
        # Handle tags
        if tags_data:
            for tag_name in tags_data:
                if tag_name:
                    tag, _ = Tag.objects.get_or_create(name=tag_name.lower())
                    blog_post.tags.add(tag)
        
        # Handle products
        if products_data:
            blog_post.products.set(products_data)
        
        return blog_post

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('_tags', None)
        products_data = validated_data.pop('_products', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle tags
        if tags_data is not None:
            instance.tags.clear()
            for tag_name in tags_data:
                if tag_name:
                    tag, _ = Tag.objects.get_or_create(name=tag_name.lower())
                    instance.tags.add(tag)
        
        # Handle products
        if products_data is not None:
            instance.products.set(products_data)
        
        return instance


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'name', 'rating', 'message', 'product', 'is_published', 'created_at']
        read_only_fields = ['is_published', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['id', 'amount_cents', 'currency', 'stripe_session_id', 'paypal_txn_id', 'status', 'email', 'metadata', 'created_at']
        read_only_fields = ['created_at']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'title', 'description', 'icon', 'order', 'is_published', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'percent', 'icon', 'order', 'is_published', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class CVSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CV
        fields = ['id', 'file', 'file_url', 'title', 'is_active', 'uploaded_at', 'updated_at']
        read_only_fields = ['uploaded_at', 'updated_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class CertificationSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Certification
        fields = ['id', 'file', 'file_url', 'title', 'issuer', 'issue_date', 'expiry_date', 
                  'is_published', 'order', 'uploaded_at', 'updated_at']
        read_only_fields = ['uploaded_at', 'updated_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def validate_percent(self, value):
        if value > 100:
            raise serializers.ValidationError('Percent cannot exceed 100')
        return value


class AboutSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = About
        fields = [
            'id', 'name', 'title', 'profile_image', 'profile_image_url', 'bio', 
            'long_description', 'location', 'email', 'website', 'linkedin_url', 
            'github_url', 'twitter_url', 'resume_url', 'is_published', 
            'updated_at', 'created_at'
        ]
        read_only_fields = ['updated_at', 'created_at']
    
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None


class HeroSerializer(serializers.ModelSerializer):
    background_video_url = serializers.SerializerMethodField()
    background_image_url = serializers.SerializerMethodField()
    typing_strings_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Hero
        fields = [
            'id', 'greeting', 'typing_prefix', 'typing_strings', 'typing_strings_list',
            'main_title', 'button1_text', 'button1_link', 'button2_text', 'button2_link',
            'background_video', 'background_video_url', 'background_image', 'background_image_url',
            'scroll_text', 'is_published', 'updated_at', 'created_at'
        ]
        read_only_fields = ['updated_at', 'created_at']
    
    def get_background_video_url(self, obj):
        if obj.background_video:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.background_video.url)
            return obj.background_video.url
        return None
    
    def get_background_image_url(self, obj):
        if obj.background_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.background_image.url)
            return obj.background_image.url
        return None
    
    def get_typing_strings_list(self, obj):
        """Convert typing_strings text to list"""
        if not obj.typing_strings:
            return []
        # Split by newline or comma
        strings = obj.typing_strings.replace('\r\n', '\n').split('\n')
        # Also split by comma if no newlines
        if len(strings) == 1:
            strings = [s.strip() for s in strings[0].split(',') if s.strip()]
        else:
            strings = [s.strip() for s in strings if s.strip()]
        return strings


class BankDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankDetail
        fields = ['id', 'bank_name', 'account_name', 'account_number', 'swift_code', 'branch', 'order', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class DonationInfoSerializer(serializers.ModelSerializer):
    banks = BankDetailSerializer(many=True, read_only=True)

    class Meta:
        model = DonationInfo
        fields = ['id', 'mtn_mobile_money', 'orange_money', 'card_number', 'banks', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class GiftCardSerializer(serializers.ModelSerializer):
    card_image_url = serializers.SerializerMethodField()

    class Meta:
        model = GiftCard
        fields = ['id', 'card_image', 'card_image_url', 'donor_name', 'donor_email', 'amount', 'notes', 'is_processed', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_card_image_url(self, obj):
        if obj.card_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.card_image.url)
            return obj.card_image.url
        return None
