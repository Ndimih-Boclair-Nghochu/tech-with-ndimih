import os
import sys
import django

# Ensure backend path is on sys.path so 'app' module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

from content.models import ContactFile
from django.core.files import File

p = os.path.join(os.path.dirname(__file__), 'test-cv.txt')
if not os.path.exists(p):
    with open(p, 'w', encoding='utf-8') as f:
        f.write('Dummy CV content')

with open(p, 'rb') as f:
    cf = ContactFile(label='Test CV (auto)', file_type='cv')
    cf.file.save('test-cv.txt', File(f), save=True)
    print('created:', cf.pk, cf.file.url)
