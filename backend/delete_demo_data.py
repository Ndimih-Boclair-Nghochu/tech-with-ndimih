#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from content.models import Portfolio, Product, BlogPost, Review

print("\n" + "="*60)
print("REMOVING DEMO DATA")
print("="*60 + "\n")

# Delete all Portfolio items except those with specific titles
portfolio_titles_to_keep = []
portfolios_deleted = 0
for p in Portfolio.objects.all():
    if p.title not in portfolio_titles_to_keep:
        print(f"✗ Deleting Portfolio: {p.title}")
        p.delete()
        portfolios_deleted += 1

# Delete all Products
products_deleted = 0
for p in Product.objects.all():
    print(f"✗ Deleting Product: {p.title}")
    p.delete()
    products_deleted += 1

# Delete all BlogPosts
blogs_deleted = 0
for b in BlogPost.objects.all():
    print(f"✗ Deleting Blog Post: {b.title}")
    b.delete()
    blogs_deleted += 1

# Keep reviews (don't delete them)
print(f"\n[NOTE] Keeping {Review.objects.count()} reviews (they are customer feedback)")

print("\n" + "="*60)
print("SUMMARY")
print("="*60)
print(f"Portfolios deleted: {portfolios_deleted}")
print(f"Products deleted: {products_deleted}")
print(f"Blog Posts deleted: {blogs_deleted}")
print(f"Reviews kept: {Review.objects.count()}")
print("="*60 + "\n")
