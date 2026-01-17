import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from content.models import Portfolio, Product, BlogPost, Review, Tag

# Create sample tags
tags_list = ['Python', 'Django', 'React', 'API', 'Web Development']
tags = [Tag.objects.get_or_create(name=tag)[0] for tag in tags_list]

# Create sample portfolios
portfolio_data = [
    {
        'title': 'E-Commerce Platform',
        'excerpt': 'Full-stack e-commerce solution with Django and React',
        'body': 'A complete e-commerce platform with payment integration, inventory management, and user authentication.',
    },
    {
        'title': 'Task Management App',
        'excerpt': 'Collaborative task management system',
        'body': 'Real-time task management with team collaboration features, notifications, and analytics.',
    },
    {
        'title': 'Analytics Dashboard',
        'excerpt': 'Data visualization and analytics dashboard',
        'body': 'Interactive analytics dashboard with charts, graphs, and real-time data updates.',
    },
    {
        'title': 'Blog Platform',
        'excerpt': 'Content management system for blogging',
        'body': 'A full-featured blogging platform with markdown support and SEO optimization.',
    },
    {
        'title': 'Mobile App Backend',
        'excerpt': 'RESTful API for mobile applications',
        'body': 'Scalable REST API backend supporting iOS and Android applications.',
    },
    {
        'title': 'Chat Application',
        'excerpt': 'Real-time messaging platform',
        'body': 'WebSocket-based real-time messaging platform with group chat support.',
    },
]

for data in portfolio_data:
    portfolio, created = Portfolio.objects.get_or_create(
        title=data['title'],
        defaults={'excerpt': data['excerpt'], 'body': data['body']}
    )
    if created:
        portfolio.tags.set(tags[:3])  # Assign random tags
        print(f"Created Portfolio: {portfolio.title}")

# Create sample products
product_data = [
    {
        'title': 'Django REST API Course',
        'description': 'Complete guide to building APIs with Django REST Framework',
        'price_cents': 4999,
    },
    {
        'title': 'React Components Library',
        'description': 'Pre-built, customizable React components for web projects',
        'price_cents': 2999,
    },
    {
        'title': 'Database Design Guide',
        'description': 'Advanced SQL and database optimization techniques',
        'price_cents': 3499,
    },
]

for data in product_data:
    product, created = Product.objects.get_or_create(
        title=data['title'],
        defaults={'description': data['description'], 'price_cents': data['price_cents']}
    )
    if created:
        print(f"Created Product: {product.title}")

# Create sample reviews
review_data = [
    {'name': 'John Doe', 'rating': 5, 'message': 'Excellent work and very professional!'},
    {'name': 'Jane Smith', 'rating': 5, 'message': 'Great attention to detail and fast delivery.'},
    {'name': 'Mike Johnson', 'rating': 4, 'message': 'Very good quality and responsive to feedback.'},
    {'name': 'Sarah Williams', 'rating': 5, 'message': 'Outstanding service and communication!'},
]

for data in review_data:
    review, created = Review.objects.get_or_create(
        name=data['name'],
        defaults={'rating': data['rating'], 'message': data['message']}
    )
    if created:
        print(f"Created Review from {review.name}")

# Create sample blog posts
blog_data = [
    {
        'title': 'Getting Started with Django',
        'excerpt': 'A beginner\'s guide to Django web framework',
        'body': 'Django is a powerful web framework that makes it easy to build web applications...',
    },
    {
        'title': 'React Hooks Deep Dive',
        'excerpt': 'Understanding React Hooks and their use cases',
        'body': 'React Hooks provide a way to use state and other React features without writing classes...',
    },
    {
        'title': 'REST API Best Practices',
        'excerpt': 'Guidelines for building scalable REST APIs',
        'body': 'A comprehensive guide to designing RESTful APIs that are maintainable and scalable...',
    },
    {
        'title': 'Database Optimization Tips',
        'excerpt': 'Performance tuning techniques for databases',
        'body': 'Learn various strategies to optimize your database queries and improve application performance...',
    },
]

for data in blog_data:
    blog, created = BlogPost.objects.get_or_create(
        title=data['title'],
        defaults={'excerpt': data['excerpt'], 'body': data['body']}
    )
    if created:
        print(f"Created BlogPost: {blog.title}")

print("\nSample data creation completed!")
print(f"Total Portfolios: {Portfolio.objects.count()}")
print(f"Total Products: {Product.objects.count()}")
print(f"Total Reviews: {Review.objects.count()}")
print(f"Total Blog Posts: {BlogPost.objects.count()}")
