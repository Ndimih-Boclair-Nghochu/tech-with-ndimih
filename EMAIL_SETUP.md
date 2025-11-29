# Email Setup Guide

To receive contact form messages directly in your email (ndimihboclair4@gmail.com), you need to configure Gmail App Password.

## Steps to Set Up Gmail App Password:

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to your Google Account: https://myaccount.google.com/
   - Navigate to Security → 2-Step Verification
   - Follow the prompts to enable it

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Enter "Website Contact Form" as the name
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

3. **Update .env File**:
   - Open the `.env` file in the project root
   - Find the line: `EMAIL_HOST_PASSWORD=YOUR_GMAIL_APP_PASSWORD_HERE`
   - Replace `YOUR_GMAIL_APP_PASSWORD_HERE` with your 16-character app password (remove spaces)
   - Example: `EMAIL_HOST_PASSWORD=abcdefghijklmnop`

4. **Restart the Backend Server**:
   - Stop the backend server (Ctrl+C)
   - Start it again: `python manage.py runserver`

## Current Email Configuration:

- **Recipient Email**: ndimihboclair4@gmail.com (configured in settings.py)
- **SMTP Host**: smtp.gmail.com
- **Port**: 587
- **TLS**: Enabled

## Testing:

After setup, test the contact form on your website. You should receive emails at ndimihboclair4@gmail.com when someone submits the contact form.

## Troubleshooting:

- **"Authentication failed"**: Make sure you're using an App Password, not your regular Gmail password
- **"Connection refused"**: Check your internet connection and firewall settings
- **No emails received**: Check spam folder, verify recipient email is correct

## Note:

The contact form is configured to send emails to: **ndimihboclair4@gmail.com**

