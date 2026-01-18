# Generated migration for Product model field changes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0024_productadmin'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='whatsapp_url',
            field=models.URLField(blank=True, help_text='WhatsApp message link for product inquiries', max_length=1000, null=True),
        ),
    ]
