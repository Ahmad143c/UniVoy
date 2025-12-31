const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, username) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'UniVoy - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">UniVoy Password Reset</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello ${username},
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You requested a password reset for your UniVoy account. Click the button below to reset your password:
            </p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              This link will expire in 1 hour for security reasons.
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              The UniVoy Team
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send password reset confirmation email
const sendPasswordResetConfirmation = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'UniVoy - Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #d4edda; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: #155724; margin-bottom: 20px;">Password Reset Successful</h2>
            <p style="color: #155724; font-size: 16px; line-height: 1.6;">
              Hello ${username},
            </p>
            <p style="color: #155724; font-size: 16px; line-height: 1.6;">
              Your password has been successfully reset. You can now log in to your UniVoy account with your new password.
            </p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Login to UniVoy
              </a>
            </div>
            <p style="color: #155724; font-size: 14px; line-height: 1.6;">
              If you didn't perform this action, please contact our support team immediately.
            </p>
            <hr style="border: none; border-top: 1px solid #c3e6cb; margin: 20px 0;">
            <p style="color: #155724; font-size: 12px;">
              Best regards,<br>
              The UniVoy Team
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    return false;
  }
};

// Send payment receipt email
const sendPaymentReceipt = async (paymentData) => {
  try {
    const transporter = createTransporter();
    
    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const paymentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: paymentData.email,
      subject: `UniVoy - Payment Receipt #${receiptNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 2px solid #4CAF50;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4CAF50; margin: 0; font-size: 28px;">UniVoy</h1>
              <p style="color: #666; margin: 5px 0; font-size: 16px;">Payment Receipt</p>
            </div>
            
            <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #ddd;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                  <h2 style="color: #333; margin: 0; font-size: 20px;">Receipt #${receiptNumber}</h2>
                  <p style="color: #666; margin: 5px 0; font-size: 14px;">Date: ${paymentDate}</p>
                </div>
                <div style="text-align: right;">
                  <div style="background-color: #4CAF50; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                    PAID
                  </div>
                </div>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Payment Details</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #666;">Payer Name:</span>
                  <span style="color: #333; font-weight: bold;">${paymentData.name}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #666;">Payer Type:</span>
                  <span style="color: #333; font-weight: bold;">${paymentData.payerType}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #666;">Email:</span>
                  <span style="color: #333; font-weight: bold;">${paymentData.email}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #666;">Payment Method:</span>
                  <span style="color: #333; font-weight: bold;">Credit/Debit Card (Stripe)</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #666;">Transaction Status:</span>
                  <span style="color: #4CAF50; font-weight: bold;">✓ Verified</span>
                </div>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #333; font-size: 18px; font-weight: bold;">Total Amount:</span>
                  <span style="color: #4CAF50; font-size: 24px; font-weight: bold;">$${paymentData.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50;">
              <h3 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 16px;">Payment Verified</h3>
              <p style="color: #2e7d32; margin: 0; font-size: 14px; line-height: 1.5;">
                Your payment has been successfully verified by our admin team. This receipt serves as proof of payment for your records.
              </p>
            </div>
            
            <div style="margin-top: 25px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">What's Next?</h3>
              <ul style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                ${paymentData.payerType === 'Student' ? 
                  '<li>Your application will be processed by our team</li><li>You will receive updates on your application status</li><li>Our consultants will guide you through the next steps</li>' :
                  '<li>Your commission payment has been recorded</li><li>You can continue providing services to your assigned students</li><li>Contact admin for any payment-related queries</li>'
                }
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;">
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 5px 0;">
                <strong>UniVoy</strong> - Your Gateway to Global Education
              </p>
              <p style="margin: 5px 0;">
                For any questions, please contact our support team
              </p>
              <p style="margin: 5px 0;">
                This is an automated receipt. Please keep this for your records.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment receipt email sent:', info.messageId);
    return { success: true, receiptNumber };
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  sendPaymentReceipt
}; 