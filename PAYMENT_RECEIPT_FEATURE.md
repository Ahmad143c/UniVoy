# Automatic Payment Receipt Generation Feature

## Overview
The UniVoy system now automatically generates and sends professional payment receipts when an admin verifies payments from students or consultants. The system generates both email receipts and PDF receipts that are automatically uploaded to student and consultant dashboards.

## Features

### 1. Automatic Receipt Generation
- When an admin clicks "Verify" on a payment, the system automatically:
  - Updates the payment status to "Verified"
  - Generates a unique receipt number (format: `REC-timestamp-randomString`)
  - Creates a professional PDF receipt using Puppeteer
  - Sends professional HTML receipt email to payer
  - Uploads PDF receipt to the system
  - Records receipt information in the database

### 2. Professional PDF Receipt Design
The PDF receipt includes:
- Unique receipt number (format: REC-timestamp-randomString)
- Payment date and time
- Payer details (name, email, type)
- Payment amount and status
- Payment method information
- Next steps based on payer type (Student vs Consultant)
- UniVoy branding and contact information
- Professional styling with green color scheme
- Watermark for authenticity

### 3. Receipt Tracking & Storage
- Each payment record now includes:
  - `receiptNumber`: Unique identifier for the receipt
  - `receiptSent`: Boolean indicating if email receipt was sent
  - `receiptSentAt`: Timestamp when email receipt was sent
  - `pdfReceiptUrl`: URL path to the PDF file
  - `pdfReceiptFilename`: Original filename of the PDF
  - `pdfReceiptGeneratedAt`: Timestamp when PDF was generated

### 4. Dashboard Integration
- **Student Dashboard**: Payment receipts shown in Documents tab below University Documents
- **Consultant Dashboard**: New "Payment Receipts" tab showing all verified payment receipts
- **Admin Dashboard**: Enhanced payment table with PDF receipt view/download options

### 5. Admin Interface Enhancements
- New "Receipt" column showing receipt status
- Visual indicators for sent receipts with tooltips
- PDF receipt view and download buttons for verified payments
- Prominent download button for easy receipt access
- "Resend" button for verified payments
- Loading states during verification
- Success messages with receipt numbers

### 6. Manual Receipt Resending
- Admins can resend email receipts for verified payments
- Useful if the original email was not received
- Generates a new receipt number for tracking

## Technical Implementation

### Backend Changes
1. **PDF Receipt Service** (`utils/pdfReceiptService.js`):
   - Added `generatePDFReceipt()` function using Puppeteer
   - Generates professional HTML templates
   - Converts HTML to PDF with proper styling
   - Handles different content for students vs consultants

2. **Email Service** (`utils/emailService.js`):
   - Added `sendPaymentReceipt()` function
   - Generates professional HTML email templates
   - Handles different content for students vs consultants

3. **Payment Model** (`models/Payment.js`):
   - Added receipt tracking fields
   - `receiptNumber`, `receiptSent`, `receiptSentAt`
   - `pdfReceiptUrl`, `pdfReceiptFilename`, `pdfReceiptGeneratedAt`

4. **Payment Routes** (`routes/payments.js`):
   - Enhanced `/verify` endpoint to generate PDF and send email receipts
   - Added `/resend-receipt` endpoint
   - Added `/receipts/:userId` endpoint to get user's receipts
   - Added `/receipt/:paymentId` endpoint to get specific receipt
   - Error handling for PDF generation and email failures

### Frontend Changes
1. **Payment Service** (`Services/paymentService.js`):
   - Added `resendReceipt()` function
   - Added `getPaymentReceipts()` function
   - Added `getPaymentReceipt()` function

2. **Student Document Component** (`Components/StudentDocument.js`):
   - Enhanced to include payment receipts section
   - Payment receipts displayed below University Documents
   - Grid layout with receipt cards
   - View and download functionality
   - Professional styling with hover effects

3. **Payment Receipts Component** (`Components/PaymentReceipts.js`):
   - New component to display payment receipts (for consultant dashboard)
   - Grid layout with receipt cards
   - View and download functionality
   - Professional styling with hover effects

4. **Admin Payment Component** (`Components/Admin/Payment.js`):
   - Enhanced UI with receipt status
   - Added PDF receipt view/download buttons
   - Added prominent download button for admin convenience
   - Added resend functionality
   - Improved user feedback

5. **Dashboard Updates**:
   - **Student Dashboard**: Payment receipts integrated into Documents tab
   - **Consultant Dashboard**: Added "Payment Receipts" tab

## Dependencies Added
- `puppeteer`: For PDF generation from HTML
- `html-pdf-node`: Alternative PDF generation (backup)

## Email Configuration
The system uses the existing email configuration:
- Gmail SMTP (configurable)
- Environment variables: `EMAIL_USER`, `EMAIL_PASSWORD`
- Fallback email addresses for development

## Usage

### For Admins
1. Navigate to Admin Dashboard → Payment tab
2. View pending payments in the table
3. Click "Verify" button to approve payment and generate receipts
4. Monitor receipt status in the "Receipt" column
5. Use view/download buttons for PDF receipts
6. Use prominent "Download" button for easy access
7. Use "Resend" button if needed

### For Students
1. Make payment through the system
2. Wait for admin verification
3. Receive professional receipt email automatically
4. Access PDF receipts in Documents tab → Payment Receipts section
5. View or download receipts as needed

### For Consultants
1. Make payment through the system
2. Wait for admin verification
3. Receive professional receipt email automatically
4. Access PDF receipts in "Payment Receipts" tab
5. View or download receipts as needed

## File Storage
- PDF receipts are stored in the `uploads/` directory
- Files are served statically via Express
- File naming: `receipt_REC-timestamp-randomString_timestamp.pdf`
- Automatic cleanup can be implemented for old receipts

## Error Handling
- If PDF generation fails, payment verification still proceeds
- If email sending fails, payment verification still proceeds
- Error logs are recorded for debugging
- Admins can manually resend receipts if needed
- Graceful degradation ensures system stability

## Benefits
1. **Professional Image**: Automated, branded PDF receipts
2. **Record Keeping**: Digital receipts for all parties
3. **Transparency**: Clear payment confirmation
4. **Efficiency**: No manual receipt generation needed
5. **Compliance**: Proper documentation for financial records
6. **Accessibility**: PDF receipts available in dashboards
7. **Archiving**: Permanent storage of receipt files
8. **Admin Convenience**: Easy download access for administrative purposes

## Future Enhancements
- Receipt search and filtering
- Receipt analytics and reporting
- Automatic receipt cleanup for old files
- Receipt watermarking for security
- Receipt validation and verification
- Bulk receipt operations
- Receipt templates customization
- Integration with accounting systems 