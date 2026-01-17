#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from content.models import Product
from content.serializers import ProductSerializer

products = Product.objects.all()
print("\n" + "="*60)
print("PRODUCTS WITH YOUTUBE URLs")
print("="*60 + "\n")

for p in products:
    serializer = ProductSerializer(p)
    print(f"Product: {p.title}")
    print(f"  YouTube URL: {serializer.data.get('youtube_url')}")
    print()

print("="*60 + "\n")
