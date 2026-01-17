#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from content.models import Portfolio, Product, BlogPost, Tag

print("\n" + "="*60)
print("CREATING SAMPLE DATA FOR STATISTICS")
print("="*60 + "\n")

# Create sample Portfolio items (Projects)
portfolio_data = [
    {
        "title": "E-Commerce Platform",
        "excerpt": "A full-stack e-commerce solution with payment integration",
        "body": "Built with Django and React, featuring real-time inventory tracking and Stripe integration.",
    },
    {
        "title": "Mobile Weather App",
        "excerpt": "Weather application for iOS and Android",
        "body": "Cross-platform mobile app using React Native with real-time weather data.",
    },
    {
        "title": "Analytics Dashboard",
        "excerpt": "Real-time data visualization dashboard",
        "body": "Interactive dashboard built with React and Recharts for business analytics.",
    },
]

portfolio_items = []
for data in portfolio_data:
    p, created = Portfolio.objects.get_or_create(
        title=data["title"],
        defaults={
            "excerpt": data["excerpt"],
            "body": data["body"],
        }
    )
    if created:
        portfolio_items.append(p)
        print(f"✓ Created Portfolio: {p.title}")
    else:
        print(f"- Portfolio already exists: {p.title}")

# Create sample Products
product_data = [
    {
        "title": "Django REST API Template",
        "description": "Ready-to-use Django REST Framework template with best practices",
        "price_cents": 1999,
        "youtube_url": "https://www.youtube.com/watch?v=jbDy-d8WCGE",
    },
    {
        "title": "React Component Library",
        "description": "Collection of reusable React components with Tailwind CSS",
        "price_cents": 2999,
        "youtube_url": "https://youtu.be/jLfHFfwOW_A",
    },
]

for data in product_data:
    p, created = Product.objects.get_or_create(
        title=data["title"],
        defaults={
            "description": data["description"],
            "price_cents": data["price_cents"],
            "youtube_url": data.get("youtube_url"),
        }
    )
    if created:
        print(f"✓ Created Product: {p.title}")
    else:
        print(f"- Product already exists: {p.title}")

# Create sample Blog Posts
blog_data = [
    {
        "title": "Getting Started with Django REST Framework",
        "excerpt": "A comprehensive guide to building APIs with Django",
        "body": "Learn how to build scalable REST APIs using Django REST Framework...",
    },
    {
        "title": "React Hooks Best Practices",
        "excerpt": "Tips and tricks for writing efficient React components",
        "body": "Understanding useState, useEffect, and custom hooks...",
    },
    {
        "title": "TypeScript for JavaScript Developers",
        "excerpt": "Introduction to static typing in JavaScript",
        "body": "Make your JavaScript code more robust with TypeScript...",
    },
]

for data in blog_data:
    b, created = BlogPost.objects.get_or_create(
        title=data["title"],
        defaults={
            "excerpt": data["excerpt"],
            "body": data["body"],
        }
    )
    if created:
        print(f"✓ Created Blog Post: {b.title}")
    else:
        print(f"- Blog Post already exists: {b.title}")

# Print summary
from content.models import Review
print("\n" + "="*60)
print("SUMMARY")
print("="*60)
print(f"Portfolios: {Portfolio.objects.count()}")
print(f"Products: {Product.objects.count()}")
print(f"Blog Posts: {BlogPost.objects.count()}")
print(f"Reviews: {Review.objects.count()}")
print("="*60 + "\n")
