#!/usr/bin/env python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from content.models import Portfolio, Product, Review, BlogPost

portfolio_count = Portfolio.objects.count()
product_count = Product.objects.count()
review_count = Review.objects.count()
blog_count = BlogPost.objects.count()

stats = {
    "projects_completed": portfolio_count,
    "projects_for_sale": product_count,
    "total_reviews": review_count,
    "blog_posts": blog_count,
}

print("=" * 60)
print("DATABASE STATISTICS")
print("=" * 60)
print(json.dumps(stats, indent=2))
print("=" * 60)
print(f"\nProjects (Portfolio): {portfolio_count}")
for p in Portfolio.objects.all()[:5]:
    print(f"  - {p.title} (slug: {p.slug})")

print(f"\nProducts: {product_count}")
for p in Product.objects.all()[:5]:
    print(f"  - {p.title} (slug: {p.slug})")

print(f"\nReviews: {review_count}")
for r in Review.objects.all()[:5]:
    rating_str = "*" * r.rating
    print(f"  - {r.name}: {rating_str} (published: {r.is_published})")

print(f"\nBlog Posts: {blog_count}")
for b in BlogPost.objects.all()[:5]:
    print(f"  - {b.title} (slug: {b.slug})")
