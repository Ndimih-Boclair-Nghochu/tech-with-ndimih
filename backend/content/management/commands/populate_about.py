from django.core.management.base import BaseCommand
from content.models import About


class Command(BaseCommand):
    help = 'Populate or update the About section with sample data'

    def handle(self, *args, **options):
        about_data = {
            'name': 'Ndimih Boclair Nghochu',
            'title': 'Software Engineer · Cloud & DevOps Specialist',
            'bio': 'I build smart, scalable, and secure digital solutions. With expertise in Cloud Architecture, DevOps automation, IAM, and full-stack development, I deliver end-to-end solutions that drive real business impact.',
            'long_description': 'I am Ndimih Boclair Nghochu, a Software Engineer, Cloud Computing & DevOps Specialist passionate about building smart, scalable, and secure digital solutions. With strong skills in web development, IAM, DevOps automation, and cloud security, I deliver end-to-end solutions across Cloud Architecture, CI/CD automation, and full-stack development. My mission is to contribute to Africa\'s digital growth through innovative technology solutions.',
            'location': 'Bamenda, Cameroon',
            'email': 'ndimihboclair4@gmail.com',
            'website': 'https://ndimihboclair.com',
            'linkedin_url': 'https://www.linkedin.com/in/ndimih-boclair-05b2a9347?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
            'github_url': 'https://github.com/Ndimih-Boclair-Nghochu',
            'twitter_url': 'https://x.com/ndimih40828?s=21',
            'resume_url': '',
            'is_published': True,
        }

        # Get or create the About instance
        about, created = About.objects.get_or_create(id=1)
        
        # Update fields
        for key, value in about_data.items():
            setattr(about, key, value)
        
        about.save()
        
        if created:
            self.stdout.write(self.style.SUCCESS('✓ About section created successfully'))
        else:
            self.stdout.write(self.style.SUCCESS('✓ About section updated successfully'))
        
        self.stdout.write(f'Name: {about.name}')
        self.stdout.write(f'Title: {about.title}')
        self.stdout.write(f'Location: {about.location}')
        self.stdout.write(f'Published: {about.is_published}')
