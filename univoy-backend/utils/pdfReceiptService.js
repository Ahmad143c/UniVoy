const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Generate PDF receipt
const generatePDFReceipt = async (paymentData) => {
  let browser = null;
  try {
    console.log('Starting PDF receipt generation for:', paymentData.email);
    
    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const paymentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create HTML content for the receipt
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt - ${receiptNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
          }
          .receipt-container {
            max-width: 800px;
            margin: 20px auto;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 32px;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          .receipt-body {
            padding: 30px;
          }
          .receipt-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
          }
          .receipt-info h2 {
            color: #333;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .receipt-info p {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .status-badge {
            background-color: #4CAF50;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
          }
          .payment-details {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .payment-details h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #666;
            font-weight: 500;
          }
          .detail-value {
            color: #333;
            font-weight: bold;
          }
          .amount-section {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 25px;
          }
          .amount-section .total-label {
            font-size: 18px;
            margin-bottom: 10px;
            opacity: 0.9;
          }
          .amount-section .total-amount {
            font-size: 36px;
            font-weight: bold;
          }
          .verification-section {
            background-color: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4CAF50;
            margin-bottom: 25px;
          }
          .verification-section h3 {
            color: #2e7d32;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .verification-section p {
            color: #2e7d32;
            font-size: 14px;
            line-height: 1.5;
          }
          .next-steps {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .next-steps h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 16px;
          }
          .next-steps ul {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
            padding-left: 20px;
          }
          .next-steps li {
            margin-bottom: 8px;
          }
          .footer {
            text-align: center;
            padding: 25px;
            background-color: #f8f9fa;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
          }
          .footer p {
            margin-bottom: 5px;
          }
          .footer strong {
            color: #4CAF50;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 48px;
            color: rgba(76, 175, 80, 0.1);
            font-weight: bold;
            pointer-events: none;
            z-index: -1;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="watermark">PAID</div>
          <div class="header">
            <h1>UniVoy</h1>
            <p>Payment Receipt</p>
          </div>
          
          <div class="receipt-body">
            <div class="receipt-header">
              <div class="receipt-info">
                <h2>Receipt #${receiptNumber}</h2>
                <p>Date: ${paymentDate}</p>
                <p>Time: ${new Date().toLocaleTimeString('en-US')}</p>
              </div>
              <div class="status-badge">PAID</div>
            </div>
            
            <div class="payment-details">
              <h3>Payment Details</h3>
              <div class="detail-row">
                <span class="detail-label">Payer Name:</span>
                <span class="detail-value">${paymentData.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payer Type:</span>
                <span class="detail-value">${paymentData.payerType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${paymentData.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">Credit/Debit Card (Stripe)</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Status:</span>
                <span class="detail-value" style="color: #4CAF50;">✓ Verified</span>
              </div>
            </div>
            
            <div class="amount-section">
              <div class="total-label">Total Amount</div>
              <div class="total-amount">$${paymentData.amount.toFixed(2)}</div>
            </div>
            
            <div class="verification-section">
              <h3>Payment Verified</h3>
              <p>Your payment has been successfully verified by our admin team. This receipt serves as proof of payment for your records.</p>
            </div>
            
            <div class="next-steps">
              <h3>What's Next?</h3>
              <ul>
                ${paymentData.payerType === 'Student' ? 
                  '<li>Your application will be processed by our team</li><li>You will receive updates on your application status</li><li>Our consultants will guide you through the next steps</li>' :
                  '<li>Your commission payment has been recorded</li><li>You can continue providing services to your assigned students</li><li>Contact admin for any payment-related queries</li>'
                }
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>UniVoy</strong> - Your Gateway to Global Education</p>
            <p>For any questions, please contact our support team</p>
            <p>This is an automated receipt. Please keep this for your records.</p>
            <p>Generated on: ${new Date().toLocaleString('en-US')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Launching Puppeteer browser...');
    
    // Launch Puppeteer with improved configuration
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('Setting HTML content...');
    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    console.log('Generating PDF...');
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Generate filename
    const filename = `receipt_${receiptNumber}_${Date.now()}.pdf`;
    
    console.log('PDF receipt generation completed successfully');
    return {
      success: true,
      pdfBuffer,
      filename,
      receiptNumber
    };

  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
};

module.exports = {
  generatePDFReceipt
}; 