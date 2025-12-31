# Payment Module Setup Guide

## Overview
This guide will help you set up the payment module properly to ensure receipts are sent via email and PDF receipts are generated and accessible in the admin dashboard.

## Prerequisites
- Node.js and npm installed
- MongoDB database running
- Gmail account for sending emails

## Step 1: Environment Configuration

Create a `.env` file in the `univoy-backend` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/univoy

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (REQUIRED for payment receipts)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5001
NODE_ENV=development
```

### Email Setup Instructions:

1. **Gmail Account Setup:**
   - Use a Gmail account for sending emails
   - Enable 2-factor authentication on your Gmail account
   - Generate an "App Password" for the application
   - Use the app password as `EMAIL_PASSWORD`

2. **App Password Generation:**
   - Go to Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification if not already enabled
   - Go to App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASSWORD`

## Step 2: Install Dependencies

In the `univoy-backend` directory:

```bash
npm install
```

## Step 3: Verify Puppeteer Installation

Puppeteer is required for PDF generation. It should be installed automatically, but if you encounter issues:

```bash
npm install puppeteer
```

## Step 4: Start the Backend Server

```bash
cd univoy-backend
npm run dev
```

## Step 5: Test the Payment Module

### Testing Email Configuration:

1. **Check Console Logs:**
   - When you verify a payment, check the backend console for email-related logs
   - Look for messages like "Payment receipt email sent successfully"

2. **Test Email Sending:**
   - Make a test payment
   - Verify the payment in admin dashboard
   - Check if the email is received

### Testing PDF Generation:

1. **Check Console Logs:**
   - Look for "PDF receipt generated successfully" messages
   - Check for any Puppeteer-related errors

2. **Verify PDF Files:**
   - Check the `univoy-backend/uploads` directory
   - PDF files should be created with names like `receipt_REC-xxx-xxx.pdf`

## Troubleshooting

### Email Not Sending

**Symptoms:**
- No email received after payment verification
- Console shows "Error sending payment receipt email"

**Solutions:**
1. **Check Environment Variables:**
   ```bash
   # In backend console, check if these are set
   console.log('EMAIL_USER:', process.env.EMAIL_USER);
   console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');
   ```

2. **Verify Gmail Settings:**
   - Ensure 2-factor authentication is enabled
   - Use app password, not regular password
   - Check if "Less secure app access" is disabled

3. **Test Email Configuration:**
   ```javascript
   // Add this to test email in backend
   const { sendPaymentReceipt } = require('./utils/emailService');
   
   sendPaymentReceipt({
     name: 'Test User',
     email: 'your-test-email@gmail.com',
     payerType: 'Student',
     amount: 100
   });
   ```

### PDF Not Generating

**Symptoms:**
- No PDF files in uploads directory
- Console shows Puppeteer errors

**Solutions:**
1. **Check Puppeteer Installation:**
   ```bash
   npm list puppeteer
   ```

2. **Install System Dependencies (Linux):**
   ```bash
   sudo apt-get update
   sudo apt-get install -y \
     gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
     libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
     libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
     libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
     libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
     libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation \
     libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

3. **Check Uploads Directory:**
   ```bash
   # Ensure uploads directory exists
   mkdir -p univoy-backend/uploads
   ```

### Admin Dashboard Issues

**Symptoms:**
- PDF preview/download buttons not working
- Receipt status not showing correctly

**Solutions:**
1. **Check Static File Serving:**
   - Ensure `/uploads` route is properly configured in `server.js`
   - Test direct access: `http://localhost:5001/uploads/filename.pdf`

2. **Check Browser Console:**
   - Look for 404 errors when clicking view/download buttons
   - Verify the PDF URLs are correct

3. **Update Frontend API URL:**
   - Ensure `REACT_APP_API_URL` is set correctly in frontend
   - Default should be `http://localhost:5001`

## Debugging Commands

### Backend Debugging:

```bash
# Check if uploads directory exists
ls -la univoy-backend/uploads/

# Check environment variables
node -e "console.log('EMAIL_USER:', process.env.EMAIL_USER)"

# Test PDF generation manually
node -e "
const { generatePDFReceipt } = require('./utils/pdfReceiptService');
generatePDFReceipt({
  name: 'Test User',
  email: 'test@example.com',
  payerType: 'Student',
  amount: 100
}).then(console.log);
"
```

### Frontend Debugging:

```bash
# Check API URL configuration
echo $REACT_APP_API_URL

# Test API connectivity
curl http://localhost:5001/api/payments
```

## Common Issues and Solutions

### Issue 1: "Email configuration not found"
**Solution:** Set `EMAIL_USER` and `EMAIL_PASSWORD` in `.env` file

### Issue 2: "Puppeteer launch failed"
**Solution:** Install system dependencies or use Docker

### Issue 3: "PDF file not found"
**Solution:** Check uploads directory permissions and ensure it exists

### Issue 4: "Receipt buttons not working"
**Solution:** Verify static file serving and API URL configuration

## Monitoring and Logs

### Backend Logs to Monitor:
- "Payment receipt email sent successfully"
- "PDF receipt generated successfully"
- "PDF receipt saved: [path]"
- "Payment verification completed successfully"

### Frontend Logs to Monitor:
- "Payment verified successfully"
- "Receipts fetched successfully"
- Any 404 errors for PDF files

## Support

If you continue to experience issues:

1. Check the browser console for errors
2. Check the backend console for detailed error messages
3. Verify all environment variables are set correctly
4. Test email and PDF generation separately
5. Ensure all dependencies are installed correctly

## Quick Test Checklist

- [ ] Environment variables set correctly
- [ ] Backend server running on port 5001
- [ ] Frontend can connect to backend API
- [ ] Email configuration working (test with a small script)
- [ ] PDF generation working (check uploads directory)
- [ ] Admin dashboard shows payment verification buttons
- [ ] Receipt preview/download buttons work
- [ ] Email receipts are received after verification 