const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Gmail Setup Assistant\n');

console.log('This script will help you set up Gmail for sending email receipts.\n');

console.log('📋 Prerequisites:');
console.log('1. You need a Gmail account');
console.log('2. You need to enable 2-Step Verification on your Google Account');
console.log('3. You need to generate an App Password\n');

console.log('📝 Step-by-step instructions:');
console.log('1. Go to https://myaccount.google.com/');
console.log('2. Click on "Security" in the left sidebar');
console.log('3. Find "2-Step Verification" and enable it if not already enabled');
console.log('4. Go back to Security and find "App passwords"');
console.log('5. Click on "App passwords"');
console.log('6. Select "Mail" from the dropdown');
console.log('7. Click "Generate"');
console.log('8. Copy the 16-character password (it will look like: xxxx xxxx xxxx xxxx)\n');

rl.question('Enter your Gmail address (e.g., yourname@gmail.com): ', (email) => {
  rl.question('Enter your Gmail app password (16 characters, no spaces): ', (password) => {
    rl.close();
    
    // Validate inputs
    if (!email.includes('@gmail.com')) {
      console.log('❌ Error: Please enter a valid Gmail address (must end with @gmail.com)');
      return;
    }
    
    if (password.length !== 16) {
      console.log('❌ Error: App password should be exactly 16 characters');
      return;
    }
    
    if (password.includes(' ')) {
      console.log('❌ Error: App password should not contain spaces');
      return;
    }
    
    // Create .env content
    const envContent = `# Email Configuration (REQUIRED for payment receipts)
EMAIL_USER=${email}
EMAIL_PASSWORD=${password}

# Other configurations (keep existing values)
MONGODB_URI=mongodb://localhost:27017/univoy
JWT_SECRET=your_jwt_secret_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
FRONTEND_URL=http://localhost:3000
PORT=5001
NODE_ENV=development
`;
    
    // Write to .env file
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Gmail configuration saved to .env file');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 App Password: ${password.substring(0, 4)}****${password.substring(12)}`);
    
    console.log('\n🔄 Next steps:');
    console.log('1. Restart your backend server: npm run dev');
    console.log('2. Test the email configuration: node test-email-config.js');
    console.log('3. If the test passes, try sending receipts from the admin dashboard');
    
    console.log('\n📚 If you need help, see: GMAIL_SETUP_GUIDE.md');
  });
}); 