"""
Monkey patch to fix Django 4.2.8 compatibility with Python 3.14.
This fixes the AttributeError: 'super' object has no attribute 'dicts'
in Django's template context copying mechanism.

The issue is that Python 3.14 changed how super() works, and when Django's
Context.__copy__ calls super().__copy__(), the returned object doesn't have
the 'dicts' attribute that can be set. We need to create the duplicate manually.
"""
import copy
import django.template.context

def _patched_context_copy(self):
    """Patched version of Context.__copy__ that works with Python 3.14."""
    # Create new instance without calling __init__ (avoids RequestContext args)
    duplicate = self.__class__.__new__(self.__class__)
    # Copy the internal dict to preserve attributes like request, template, etc.
    duplicate.__dict__ = self.__dict__.copy()
    # Copy the dict stack explicitly to avoid sharing mutable state
    duplicate.dicts = self.dicts[:]
    return duplicate

# Apply the patch before Django uses the original method
django.template.context.Context.__copy__ = _patched_context_copy

