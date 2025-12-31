const { sendPaymentReceipt } = require('./utils/emailService');
require('dotenv').config();

console.log('🔍 Testing Email Configuration...\n');

// Check environment variables
console.log('📧 Environment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('\n❌ Email configuration missing!');
  console.log('Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
  console.log('Example:');
  console.log('EMAIL_USER=your-email@gmail.com');
  console.log('EMAIL_PASSWORD=your-app-password');
  process.exit(1);
}

console.log('\n✅ Email configuration found');

// Test email sending
const testPaymentData = {
  name: 'Test User',
  email: 'test@example.com', // Change this to your email for testing
  payerType: 'Student',
  amount: 100
};

console.log('\n📧 Testing Email Sending...');
console.log('Sending test email to:', testPaymentData.email);

sendPaymentReceipt(testPaymentData)
  .then(result => {
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📄 Receipt number:', result.receiptNumber);
      console.log('\n🎉 Email configuration is working correctly!');
    } else {
      console.log('❌ Email sending failed:');
      console.log('Error:', result.error);
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check your Gmail app password is correct');
      console.log('2. Ensure 2-factor authentication is enabled');
      console.log('3. Verify the email address is correct');
      console.log('4. Check if Gmail is blocking the connection');
    }
  })
  .catch(error => {
    console.log('❌ Email test failed with exception:');
    console.log('Error:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your .env file has correct credentials');
    console.log('2. Verify Gmail app password is correct');
    console.log('3. Ensure 2-factor authentication is enabled');
    console.log('4. Try generating a new app password');
  }); 