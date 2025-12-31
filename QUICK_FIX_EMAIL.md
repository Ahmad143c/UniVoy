# Quick Fix: Email Receipt Issue

## Problem
The 500 error you're seeing is because Gmail is rejecting the authentication credentials. The receipts show "Pending" because email sending fails.

## Solution

### Option 1: Use the Setup Script (Recommended)
```bash
cd univoy-backend
node setup-gmail.js
```
This will guide you through the setup process step by step.

### Option 2: Manual Setup

1. **Enable 2-Step Verification**:
   - Go to https://myaccount.google.com/
   - Click "Security" → "2-Step Verification"
   - Enable it if not already enabled

2. **Generate App Password**:
   - Go to Security → "App passwords"
   - Select "Mail" from dropdown
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env file**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```

4. **Test the setup**:
   ```bash
   node test-email-config.js
   ```

5. **Restart server**:
   ```bash
   npm run dev
   ```

## Expected Results

After fixing the Gmail configuration:
- ✅ Email receipts will be sent automatically when payments are verified
- ✅ Receipt status will change from "Pending" to "Sent"
- ✅ Resend function will work for both pending and sent receipts
- ✅ No more 500 errors when clicking "Send Receipt"

## Troubleshooting

### If you still get 500 errors:
1. Check that 2-Step Verification is enabled
2. Verify the app password is exactly 16 characters (no spaces)
3. Ensure the email address is correct (including @gmail.com)
4. Restart the server after updating .env

### If the test script fails:
1. Double-check the app password
2. Try generating a new app password
3. Make sure you're using the app password, not your regular Gmail password

## Alternative: Use a Different Email Service

If Gmail continues to cause issues, you can switch to Outlook:

1. Update `utils/emailService.js`:
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

2. Update your .env file:
   ```env
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASSWORD=your-outlook-password
   ```

The main issue is Gmail authentication. Once you set up the app password correctly, everything should work perfectly! 