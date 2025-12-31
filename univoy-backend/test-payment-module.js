const { sendPaymentReceipt } = require('./utils/emailService');
const { generatePDFReceipt } = require('./utils/pdfReceiptService');
const path = require('path');
const fs = require('fs');

// Test configuration
const testPaymentData = {
  name: 'Test User',
  email: 'test@example.com', // Change this to your email for testing
  payerType: 'Student',
  amount: 100
};

console.log('🧪 Testing Payment Module...\n');

// Test 1: Email Configuration
console.log('📧 Testing Email Configuration...');
try {
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
    console.log('📝 See PAYMENT_SETUP_GUIDE.md for setup instructions');
  } else {
    console.log('✅ Email configuration found');
  }
} catch (error) {
  console.log('❌ Error checking email configuration:', error.message);
}

console.log('\n📧 Testing Email Sending...');
sendPaymentReceipt(testPaymentData)
  .then(result => {
    if (result.success) {
      console.log('✅ Email sent successfully');
      console.log('📄 Receipt number:', result.receiptNumber);
    } else {
      console.log('❌ Email sending failed:', result.error);
      console.log('💡 Check your Gmail app password configuration');
    }
  })
  .catch(error => {
    console.log('❌ Email test failed:', error.message);
  });

// Test 2: PDF Generation
console.log('\n📄 Testing PDF Generation...');
generatePDFReceipt(testPaymentData)
  .then(result => {
    if (result.success) {
      console.log('✅ PDF generated successfully');
      console.log('📁 Filename:', result.filename);
      console.log('📏 Size:', result.pdfBuffer.length, 'bytes');
      
      // Test saving the PDF
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('📁 Created uploads directory');
      }
      
      const pdfPath = path.join(uploadsDir, result.filename);
      fs.writeFileSync(pdfPath, result.pdfBuffer);
      console.log('💾 PDF saved to:', pdfPath);
      
      // Check if file exists
      if (fs.existsSync(pdfPath)) {
        console.log('✅ PDF file saved successfully');
        const stats = fs.statSync(pdfPath);
        console.log('📏 File size:', stats.size, 'bytes');
      } else {
        console.log('❌ PDF file not found after saving');
      }
    } else {
      console.log('❌ PDF generation failed:', result.error);
      console.log('💡 Check if Puppeteer is installed correctly');
    }
  })
  .catch(error => {
    console.log('❌ PDF test failed:', error.message);
  });

// Test 3: Uploads Directory
console.log('\n📁 Testing Uploads Directory...');
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
  console.log('✅ Uploads directory exists');
  const files = fs.readdirSync(uploadsDir);
  console.log('📄 Files in uploads directory:', files.length);
  if (files.length > 0) {
    console.log('📋 Files:', files.slice(0, 5).join(', '));
  }
} else {
  console.log('❌ Uploads directory does not exist');
  console.log('💡 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

// Test 4: Static File Serving
console.log('\n🌐 Testing Static File Serving...');
const testFile = path.join(uploadsDir, 'test.txt');
fs.writeFileSync(testFile, 'Test file for static serving');
console.log('📄 Created test file:', testFile);

console.log('\n📋 Test Summary:');
console.log('1. Email Configuration: Check console output above');
console.log('2. PDF Generation: Check console output above');
console.log('3. Uploads Directory: Check console output above');
console.log('4. Static File Serving: Test file created');

console.log('\n🔧 Next Steps:');
console.log('1. Set up your .env file with EMAIL_USER and EMAIL_PASSWORD');
console.log('2. Update the test email address in this script');
console.log('3. Run this test again: node test-payment-module.js');
console.log('4. Check your email for the test receipt');
console.log('5. Verify PDF files are created in the uploads directory');

console.log('\n📚 For detailed setup instructions, see: PAYMENT_SETUP_GUIDE.md'); 