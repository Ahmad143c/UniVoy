# Gmail Setup Guide - Fix Email Receipt Issues

## Current Issue
The email receipts are showing as "Pending" because Gmail is rejecting the authentication credentials. The error shows:
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

## Solution Steps

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Find "2-Step Verification" and click on it
4. Follow the steps to enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. In the same Security section, find "App passwords"
2. Click on "App passwords"
3. Select "Mail" from the dropdown
4. Click "Generate"
5. Copy the 16-character password (it will look like: xxxx xxxx xxxx xxxx)

### Step 3: Update Your .env File
In your `univoy-backend/.env` file, update these lines:
```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Important Notes:**
- Use your full Gmail address (including @gmail.com)
- Use the app password, NOT your regular Gmail password
- Remove any spaces from the app password
- Make sure there are no extra spaces or quotes around the values

### Step 4: Test the Configuration
Run the test script to verify the email configuration:
```bash
cd univoy-backend
node test-email-config.js
```

Expected output:
```
✅ Email configuration found
✅ Email sent successfully!
🎉 Email configuration is working correctly!
```

### Step 5: Restart Your Server
After updating the .env file, restart your backend server:
```bash
npm run dev
```

## Common Issues and Solutions

### Issue 1: "Username and Password not accepted"
**Causes:**
- Using regular password instead of app password
- 2-Step Verification not enabled
- Incorrect email format
- App password has spaces

**Solutions:**
1. Ensure 2-Step Verification is enabled
2. Generate a new app password
3. Check email format: `your-email@gmail.com`
4. Remove spaces from app password

### Issue 2: "Less secure app access"
**Solution:** This is no longer supported by Google. You must use app passwords.

### Issue 3: "Authentication failed"
**Solutions:**
1. Double-check the app password
2. Try generating a new app password
3. Ensure the email address is correct

## Alternative: Use a Different Email Service

If Gmail continues to cause issues, you can switch to another email service:

### Option 1: Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

Update the email service in `utils/emailService.js`:
```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'outlook',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};
```

### Option 2: Yahoo
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

Update the email service in `utils/emailService.js`:
```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'yahoo',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};
```

## Testing After Setup

1. **Test Email Configuration:**
   ```bash
   node test-email-config.js
   ```

2. **Test Payment Verification:**
   - Go to admin dashboard
   - Verify a payment
   - Check if receipt status changes from "Pending" to "Sent"

3. **Test Resend Function:**
   - For payments with "Pending" receipts, click "Send Receipt"
   - For payments with "Sent" receipts, click "Resend"

## Troubleshooting Checklist

- [ ] 2-Step Verification is enabled
- [ ] App password is generated for "Mail"
- [ ] .env file has correct EMAIL_USER and EMAIL_PASSWORD
- [ ] No spaces in app password
- [ ] Email format is correct (including @gmail.com)
- [ ] Backend server is restarted after .env changes
- [ ] Test script shows "Email sent successfully"

## Support

If you continue to have issues:
1. Check the Google Account security settings
2. Try generating a new app password
3. Consider using a different email service
4. Check the backend console for detailed error messages 