#!/usr/bin/env python
import requests
import json

print("\n" + "="*60)
print("API ENDPOINT TESTS")
print("="*60 + "\n")

base_url = "http://localhost:8000/api"

# Test Reviews
print("[1] Testing /reviews/ endpoint:")
try:
    resp = requests.get(f"{base_url}/reviews/")
    reviews = resp.json()
    print(f"  Status: {resp.status_code}")
    print(f"  Count: {len(reviews) if isinstance(reviews, list) else (reviews.get('results') and len(reviews['results']) or 0)}")
    if isinstance(reviews, list):
        print(f"  Type: Array")
        if len(reviews) > 0:
            print(f"  First: {reviews[0]}")
    else:
        print(f"  Type: Object with 'results' key")
        if reviews.get('results'):
            print(f"  First: {reviews['results'][0]}")
except Exception as e:
    print(f"  ERROR: {e}")

# Test Portfolio
print("\n[2] Testing /portfolio/ endpoint:")
try:
    resp = requests.get(f"{base_url}/portfolio/")
    data = resp.json()
    count = len(data) if isinstance(data, list) else (data.get('results') and len(data['results']) or 0)
    print(f"  Status: {resp.status_code}")
    print(f"  Count: {count}")
except Exception as e:
    print(f"  ERROR: {e}")

# Test Products
print("\n[3] Testing /products/ endpoint:")
try:
    resp = requests.get(f"{base_url}/products/")
    data = resp.json()
    count = len(data) if isinstance(data, list) else (data.get('results') and len(data['results']) or 0)
    print(f"  Status: {resp.status_code}")
    print(f"  Count: {count}")
except Exception as e:
    print(f"  ERROR: {e}")

# Test Blog
print("\n[4] Testing /blog/ endpoint:")
try:
    resp = requests.get(f"{base_url}/blog/")
    data = resp.json()
    count = len(data) if isinstance(data, list) else (data.get('results') and len(data['results']) or 0)
    print(f"  Status: {resp.status_code}")
    print(f"  Count: {count}")
except Exception as e:
    print(f"  ERROR: {e}")

print("\n" + "="*60)
