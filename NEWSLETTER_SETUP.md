# Newsletter Notification System

## Overview

Your subscribers are automatically notified whenever you create:
- **📁 New Portfolio Projects**
- **📝 New Blog Posts**  
- **💼 New Projects for Sale** (when published)

## Setup

### Email Configuration

The notification system requires email configuration in your `.env` file:

```env
# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

#### For Gmail Users:

1. Enable 2-Factor Authentication on your Google Account
2. Create an **App Password** (not your regular password):
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password
3. Use this password as `EMAIL_HOST_PASSWORD` in `.env`

#### For Other Email Providers:

- **SendGrid**: Use `SENDGRID_API_KEY` and set `EMAIL_BACKEND` to SendGrid's backend
- **Mailgun**: Similar setup with API key
- **Custom SMTP**: Provide your provider's SMTP details

### How It Works

When you create a new item in Admin Dashboard:
1. Item is saved to database
2. If it's published, email notification is queued
3. All active newsletter subscribers receive an email with:
   - Title and description
   - Cover image (if available)
   - Link to view the full item
   - Professional branded email template

### Notification Details

**Email Template Includes:**
- Purple gradient header with update type icon
- Item title and description preview
- Cover image (if available)
- "View Details" button with direct link
- Unsubscribe link for subscribers
- Professional footer

**Automatic Triggers:**
- ✅ Create Portfolio project → Notify subscribers
- ✅ Create Blog post → Notify subscribers  
- ✅ Create Project for Sale (published only) → Notify subscribers
- ❌ Drafts/Unpublished items → No notification

## Testing

To test email sending locally:

```python
# In Django shell:
python manage.py shell

from content.notifications import send_update_notification

send_update_notification(
    subject='Test: New Project',
    content_type='portfolio',
    content_data={
        'title': 'Test Project',
        'description': 'This is a test notification',
        'url': 'https://ndimihboclair.com/portfolio/test',
        'image_url': None
    }
)
```

If successful, you'll see:
```
Sent 'portfolio' notification to X subscribers
```

## Troubleshooting

**Emails not sending:**
1. Check `.env` file has all EMAIL_ variables set
2. Verify Gmail app password is correct (not regular password)
3. Check Django logs: `python manage.py runserver --debug`
4. Test with: `python manage.py shell` and `send_mail()` function

**SSL/TLS Errors:**
- Use `EMAIL_USE_TLS=True` (port 587)
- Or use `EMAIL_USE_SSL=True` (port 465)

**Authentication Errors:**
- Verify `EMAIL_HOST_USER` matches your email provider username
- For Gmail, ensure you're using the 16-char app password, not account password
- Check that "Less secure app access" is not being blocked

## Customization

Edit `backend/content/notifications.py` to:
- Change email template HTML/styling
- Add more content types
- Modify subject lines
- Add custom branding

The notification system is production-ready and can handle:
- Multiple subscribers (batched emails)
- Failed email recovery
- Detailed logging for debugging
