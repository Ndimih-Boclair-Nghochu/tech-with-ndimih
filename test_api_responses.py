#!/usr/bin/env python
"""
Test script to verify API responses for Statistics, Services, and Skills
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from content.views import ServiceViewSet, SkillViewSet, PortfolioViewSet
from content.models import Service, Skill, Portfolio, Product, BlogPost, Review

# Create API factory
factory = APIRequestFactory()

print("=" * 70)
print("API RESPONSE TEST")
print("=" * 70)

# Test Services API
print("\n1. SERVICES API (/api/services/)")
print("-" * 70)
view = ServiceViewSet.as_view({'get': 'list'})
request = factory.get('/api/services/')
response = view(request)
print(f"Status: {response.status_code}")
print(f"Response type: {type(response.data)}")
print(f"Services returned: {len(response.data) if isinstance(response.data, list) else (len(response.data.get('results', [])) if isinstance(response.data, dict) else 0)}")
if isinstance(response.data, list):
    for s in response.data[:3]:
        print(f"  - {s.get('title', 'N/A')}: published={s.get('is_published')}")
else:
    print(f"Response: {response.data}")

# Test Skills API  
print("\n2. SKILLS API (/api/skills/)")
print("-" * 70)
view = SkillViewSet.as_view({'get': 'list'})
request = factory.get('/api/skills/')
response = view(request)
print(f"Status: {response.status_code}")
print(f"Response type: {type(response.data)}")
print(f"Skills returned: {len(response.data) if isinstance(response.data, list) else (len(response.data.get('results', [])) if isinstance(response.data, dict) else 0)}")
if isinstance(response.data, list):
    for s in response.data[:5]:
        print(f"  - {s.get('name', 'N/A')}: {s.get('percent')}%")
else:
    print(f"Response: {response.data}")

# Test Statistics (database counts)
print("\n3. STATISTICS DATA (from database)")
print("-" * 70)
stats = {
    "projects_completed": Portfolio.objects.count(),
    "projects_for_sale": Product.objects.count(),
    "total_reviews": Review.objects.filter(is_published=True).count(),
    "blog_posts": BlogPost.objects.count(),
}
print(json.dumps(stats, indent=2))

print("\n" + "=" * 70)
print("✓ All APIs should be working correctly!")
print("=" * 70)
