# Generated migration for Product model field changes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0024_productadmin'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='affiliate_url',
        ),
        migrations.RemoveField(
            model_name='product',
            name='youtube_url',
        ),
        migrations.RemoveField(
            model_name='product',
            name='github_url',
        ),
        migrations.AddField(
            model_name='product',
            name='whatsapp_url',
            field=models.URLField(blank=True, help_text='WhatsApp message link for product inquiries', max_length=1000, null=True),
        ),
    ]
