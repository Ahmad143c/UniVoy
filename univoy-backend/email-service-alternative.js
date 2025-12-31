const nodemailer = require('nodemailer');

// Alternative email service configurations
const emailServices = {
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  outlook: {
    service: 'outlook',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },
  yahoo: {
    service: 'yahoo',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },
  custom: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  }
};

// Create transporter based on service type
const createTransporter = (serviceType = 'gmail') => {
  const config = emailServices[serviceType];
  
  if (!config) {
    throw new Error(`Unsupported email service: ${serviceType}`);
  }
  
  return nodemailer.createTransporter(config);
};

// Test email configuration
const testEmailConfig = async (serviceType = 'gmail') => {
  try {
    console.log(`Testing ${serviceType} email configuration...`);
    
    const transporter = createTransporter(serviceType);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'test@example.com',
      subject: 'Test Email from UniVoy',
      text: 'This is a test email to verify email configuration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ ${serviceType} email sent successfully:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ ${serviceType} email failed:`, error.message);
    return { success: false, error: error.message };
  }
};

// Test all email services
const testAllServices = async () => {
  console.log('🔍 Testing All Email Services...\n');
  
  const services = ['gmail', 'outlook', 'yahoo', 'custom'];
  
  for (const service of services) {
    const result = await testEmailConfig(service);
    console.log(`${result.success ? '✅' : '❌'} ${service}: ${result.success ? 'Success' : result.error}\n`);
  }
};

module.exports = {
  createTransporter,
  testEmailConfig,
  testAllServices
};

// Run tests if called directly
if (require.main === module) {
  testAllServices();
} 