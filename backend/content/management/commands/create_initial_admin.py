from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create or update the initial admin user (ndimihboclair4@gmail.com) with the provided password.'

    def handle(self, *args, **options):
        User = get_user_model()
        email = 'ndimihboclair4@gmail.com'
        password = '@Boclair444'
        username = email.split('@')[0]

        user_qs = User.objects.filter(email=email)
        if user_qs.exists():
            user = user_qs.first()
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.username = username
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated existing admin user: {email}'))
        else:
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Created new admin user: {email}'))
