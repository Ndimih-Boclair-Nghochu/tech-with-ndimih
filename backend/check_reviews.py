#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from content.models import Review

reviews = Review.objects.all()
print(f"Total reviews in database: {reviews.count()}\n")

for r in reviews:
    print(f"ID: {r.id}")
    print(f"  Name: {r.name}")
    print(f"  Rating: {r.rating}★")
    print(f"  Message: {r.message[:100]}...")
    print(f"  Published: {r.is_published}")
    print(f"  Created: {r.created_at}\n")
