"""
Notification system for newsletter subscribers on platform updates
"""
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Newsletter
import logging

logger = logging.getLogger(__name__)


def send_update_notification(subject, content_type, content_data):
    """
    Send notification email to all active newsletter subscribers about a platform update.
    
    Args:
        subject: Email subject line
        content_type: Type of update ('portfolio', 'blog', 'project_for_sale')
        content_data: Dict with 'title', 'description', 'url', 'image_url' (optional)
    """
    try:
        subscribers = Newsletter.objects.filter(is_active=True)
        if not subscribers.exists():
            logger.info("No active newsletter subscribers to notify")
            return False
        
        subscriber_emails = [sub.email for sub in subscribers]
        
        # Prepare email content
        html_message = render_notification_html(content_type, content_data)
        plain_message = strip_tags(html_message)
        
        # Send emails
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=None,  # Uses DEFAULT_FROM_EMAIL from settings
            recipient_list=subscriber_emails,
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Sent '{content_type}' notification to {len(subscriber_emails)} subscribers")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send notification: {str(e)}")
        return False


def render_notification_html(content_type, data):
    """Render HTML email template for update notification"""
    
    type_emoji = {
        'portfolio': '📁',
        'blog': '📝',
        'project_for_sale': '💼'
    }.get(content_type, '✨')
    
    type_name = {
        'portfolio': 'New Project',
        'blog': 'New Blog Post',
        'project_for_sale': 'New Project for Sale'
    }.get(content_type, 'Update')
    
    html_content = f"""
    <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .title {{ font-size: 24px; font-weight: bold; margin: 15px 0; color: #333; }}
                .description {{ color: #666; margin: 15px 0; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; margin-top: 15px; }}
                .footer {{ text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }}
                .image {{ max-width: 100%; height: auto; margin: 20px 0; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="font-size: 48px; margin-bottom: 10px;">{type_emoji}</div>
                    <div style="font-size: 28px;">{type_name}</div>
                </div>
                <div class="content">
                    <p>Hi there! 👋</p>
                    <p>I just published something new on my platform:</p>
                    
                    <div class="title">{data.get('title', 'Untitled')}</div>
                    
                    {f'<img src="{data["image_url"]}" alt="{data.get("title")}" class="image">' if data.get('image_url') else ''}
                    
                    <div class="description">{data.get('description', '')}</div>
                    
                    <a href="{data.get('url', '#')}" class="button">View Details</a>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 14px;">
                        Thanks for being part of my audience! I share new projects, insights, and updates regularly.
                    </p>
                </div>
                <div class="footer">
                    <p>You're receiving this because you subscribed to updates from ndimihboclair.com</p>
                    <p><a href="{data.get('unsubscribe_url', '#')}" style="color: #999; text-decoration: none;">Unsubscribe</a></p>
                </div>
            </div>
        </body>
    </html>
    """
    
    return html_content
