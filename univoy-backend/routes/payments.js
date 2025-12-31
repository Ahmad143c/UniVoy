const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Stripe = require('stripe');
const { sendPaymentReceipt } = require('../utils/emailService');
const { generatePDFReceipt } = require('../utils/pdfReceiptService');
const path = require('path');
const fs = require('fs');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a Stripe PaymentIntent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount is required' });
    // Stripe expects amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'usd',
      payment_method_types: ['card'],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new payment
router.post('/', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get all payments
    const allPayments = await Payment.find().sort({ createdAt: -1 });
    
    // Filter out payments from deleted users
    const activePayments = [];
    let skippedCount = 0;
    
    for (const payment of allPayments) {
      
      if (payment.user) {
        try {
          // Check if the user still exists
          const user = await User.findById(payment.user);
          if (user) {
            activePayments.push(payment);
          } else {
            skippedCount++;
          }
        } catch (err) {
          skippedCount++;
        }
      } else {
        // If no user field, include the payment (for backward compatibility)
        activePayments.push(payment);
      }
    }
    
    res.json(activePayments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify a payment
router.patch('/:id/verify', async (req, res) => {
  try {
    console.log('Verifying payment with ID:', req.params.id);
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      console.log('Payment not found with ID:', req.params.id);
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log('Found payment:', {
      id: payment._id,
      name: payment.name,
      email: payment.email,
      status: payment.status,
      amount: payment.amount
    });

    // Update payment status to verified
    payment.status = 'Verified';
    
    // Generate PDF receipt and upload it
    if (!payment.pdfReceiptUrl) {
      console.log('Generating PDF receipt for payment:', payment._id);
      try {
        const pdfResult = await generatePDFReceipt({
          name: payment.name,
          email: payment.email,
          payerType: payment.payerType,
          amount: payment.amount
        });
        if (pdfResult.success) {
          console.log('PDF receipt generated successfully');
          // Ensure uploads directory exists
          const uploadsDir = path.join(__dirname, '..', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('Created uploads directory:', uploadsDir);
          }
          // Save PDF to uploads directory
          const pdfPath = path.join(uploadsDir, pdfResult.filename);
          fs.writeFileSync(pdfPath, pdfResult.pdfBuffer);
          // Update payment with PDF receipt information
          payment.receiptNumber = pdfResult.receiptNumber;
          payment.pdfReceiptUrl = `/uploads/${pdfResult.filename}`;
          payment.pdfReceiptFilename = pdfResult.filename;
          payment.pdfReceiptGeneratedAt = new Date();
          console.log(`PDF receipt saved: ${pdfPath}`);
          console.log(`PDF receipt URL: ${payment.pdfReceiptUrl}`);
        } else {
          console.error('Failed to generate PDF receipt:', pdfResult.error);
          // Log more details for debugging
          if (pdfResult.error && pdfResult.error.stack) {
            console.error('PDF generation error stack:', pdfResult.error.stack);
          }
          // Continue with payment verification even if PDF generation fails
        }
      } catch (pdfGenError) {
        console.error('Exception during PDF receipt generation:', pdfGenError);
        if (pdfGenError && pdfGenError.stack) {
          console.error('PDF generation exception stack:', pdfGenError.stack);
        }
      }
    } else {
      console.log('PDF receipt already exists for payment:', payment._id);
    }
    
    // Send email receipt if not already sent
    if (!payment.receiptSent) {
      console.log('Sending payment receipt email to:', payment.email);
      
      try {
        const receiptResult = await sendPaymentReceipt({
          name: payment.name,
          email: payment.email,
          payerType: payment.payerType,
          amount: payment.amount
        });

        if (receiptResult.success) {
          payment.receiptSent = true;
          payment.receiptSentAt = new Date();
          payment.receiptNumber = receiptResult.receiptNumber;
          console.log(`Payment receipt email sent successfully for payment ${payment._id}`);
          console.log(`Receipt number: ${receiptResult.receiptNumber}`);
        } else {
          console.error('Failed to send payment receipt email:', receiptResult.error);
          // Mark as failed but continue with payment verification
          payment.receiptSent = false;
          payment.receiptError = receiptResult.error;
          console.log('Email sending failed, but payment verification continues');
        }
      } catch (emailError) {
        console.error('Exception during email sending:', emailError);
        payment.receiptSent = false;
        payment.receiptError = emailError.message;
        console.log('Email sending exception, but payment verification continues');
      }
    } else {
      console.log('Receipt email already sent for payment:', payment._id);
    }

    await payment.save();
    console.log('Payment saved successfully with updated receipt information');

    // Mark related course application as paid using courseId
    try {
      const CourseApplication = require('../models/CourseApplication');
      if (payment.courseId) {
        // Try matching user as ObjectId or string
        let application = await CourseApplication.findOne({
          user: payment.user,
          courseId: payment.courseId
        });
        if (!application) {
          // Try matching user as string (for Google users or legacy data)
          application = await CourseApplication.findOne({
            user: payment.user.toString(),
            courseId: payment.courseId
          });
        }
        if (application) {
          application.paymentCompleted = true;
          await application.save();
          console.log('Course application updated with paymentCompleted: true');
        } else {
          console.warn('No matching course application found for payment to mark as paid (courseId)');
        }
      } else {
        console.warn('Payment does not have courseId, cannot reliably link to application');
      }
    } catch (err) {
      console.error('Error updating course application payment status:', err);
    }

    // Return the updated payment with all receipt information
    const responseData = {
      payment: payment.toObject(),
      receiptSent: payment.receiptSent,
      receiptNumber: payment.receiptNumber,
      pdfReceiptUrl: payment.pdfReceiptUrl,
      pdfReceiptFilename: payment.pdfReceiptFilename,
      pdfReceiptGeneratedAt: payment.pdfReceiptGeneratedAt,
      receiptSentAt: payment.receiptSentAt
    };

    console.log('Payment verification completed successfully');
    console.log('Response data:', {
      receiptSent: responseData.receiptSent,
      receiptNumber: responseData.receiptNumber,
      pdfReceiptUrl: responseData.pdfReceiptUrl
    });

    res.json(responseData);
  } catch (err) {
    console.error('Error verifying payment:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack
    });
    res.status(400).json({ error: err.message });
  }
});

// Resend payment receipt
router.post('/:id/resend-receipt', async (req, res) => {
  try {
    console.log('Resending receipt for payment ID:', req.params.id);
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      console.log('Payment not found with ID:', req.params.id);
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log('Found payment for resend:', {
      id: payment._id,
      name: payment.name,
      email: payment.email,
      status: payment.status,
      receiptSent: payment.receiptSent
    });

    if (payment.status !== 'Verified') {
      console.log('Payment not verified, cannot resend receipt');
      return res.status(400).json({ error: 'Can only resend receipts for verified payments' });
    }

    console.log('Attempting to send receipt email to:', payment.email);
    
    // Regenerate PDF if missing
    if (!payment.pdfReceiptUrl) {
      console.log('PDF receipt missing, regenerating for payment:', payment._id);
      const { generatePDFReceipt } = require('../utils/pdfReceiptService');
      const pdfResult = await generatePDFReceipt({
        name: payment.name,
        email: payment.email,
        payerType: payment.payerType,
        amount: payment.amount
      });
      if (pdfResult.success) {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const pdfPath = path.join(uploadsDir, pdfResult.filename);
        fs.writeFileSync(pdfPath, pdfResult.pdfBuffer);
        payment.receiptNumber = pdfResult.receiptNumber;
        payment.pdfReceiptUrl = `/uploads/${pdfResult.filename}`;
        payment.pdfReceiptFilename = pdfResult.filename;
        payment.pdfReceiptGeneratedAt = new Date();
        console.log(`PDF receipt regenerated and saved: ${pdfPath}`);
      } else {
        console.error('Failed to regenerate PDF receipt:', pdfResult.error);
      }
    }
    try {
      const receiptResult = await sendPaymentReceipt({
        name: payment.name,
        email: payment.email,
        payerType: payment.payerType,
        amount: payment.amount
      });
      if (receiptResult.success) {
        payment.receiptNumber = receiptResult.receiptNumber;
        payment.receiptSent = true;
        payment.receiptSentAt = new Date();
        payment.receiptError = null;
        await payment.save();
        res.json({
          success: true,
          message: 'Receipt resent successfully',
          receiptNumber: receiptResult.receiptNumber,
          receiptSent: true,
          receiptSentAt: payment.receiptSentAt,
          pdfReceiptUrl: payment.pdfReceiptUrl,
          pdfReceiptFilename: payment.pdfReceiptFilename,
          pdfReceiptGeneratedAt: payment.pdfReceiptGeneratedAt
        });
      } else {
        console.error('Failed to resend receipt:', receiptResult.error);
        payment.receiptError = receiptResult.error;
        payment.receiptSent = false;
        await payment.save();
        let errorMessage = 'Failed to send receipt';
        if (receiptResult.error && receiptResult.error.includes('Username and Password not accepted')) {
          errorMessage = 'Email configuration error: Please check Gmail app password settings';
        } else if (receiptResult.error) {
          errorMessage = `Email sending failed: ${receiptResult.error}`;
        }
        res.status(500).json({
          success: false,
          error: errorMessage,
          details: receiptResult.error,
          requiresSetup: receiptResult.error && receiptResult.error.includes('Username and Password not accepted')
        });
      }
    } catch (emailError) {
      console.error('Exception during receipt resend:', emailError);
      payment.receiptError = emailError.message;
      payment.receiptSent = false;
      await payment.save();
      let errorMessage = 'Failed to send receipt';
      if (emailError.message && emailError.message.includes('Username and Password not accepted')) {
        errorMessage = 'Email configuration error: Please check Gmail app password settings';
      } else if (emailError.message) {
        errorMessage = `Email sending failed: ${emailError.message}`;
      }
      res.status(500).json({
        success: false,
        error: errorMessage,
        details: emailError.message,
        requiresSetup: emailError.message && emailError.message.includes('Username and Password not accepted')
      });
    }
  } catch (err) {
    console.error('Error resending receipt:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack
    });
    res.status(400).json({ error: err.message });
  }
});

// Get payment receipts for a user
router.get('/receipts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching receipts for user ID:', userId);
    
    const payments = await Payment.find({
      user: userId,
      status: 'Verified',
      pdfReceiptUrl: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    console.log('Found payments:', payments.length);
    console.log('Payments:', payments.map(p => ({ id: p._id, user: p.user, status: p.status, pdfReceiptUrl: p.pdfReceiptUrl })));

    const receipts = payments.map(payment => ({
      id: payment._id,
      receiptNumber: payment.receiptNumber,
      amount: payment.amount,
      payerType: payment.payerType,
      pdfReceiptUrl: payment.pdfReceiptUrl,
      pdfReceiptFilename: payment.pdfReceiptFilename,
      pdfReceiptGeneratedAt: payment.pdfReceiptGeneratedAt,
      createdAt: payment.createdAt
    }));

    console.log('Returning receipts:', receipts.length);
    res.json({ receipts });
  } catch (err) {
    console.error('Error fetching payment receipts:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a specific payment receipt
router.get('/receipt/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (!payment.pdfReceiptUrl) {
      return res.status(404).json({ error: 'PDF receipt not found' });
    }

    res.json({
      id: payment._id,
      receiptNumber: payment.receiptNumber,
      amount: payment.amount,
      payerType: payment.payerType,
      pdfReceiptUrl: payment.pdfReceiptUrl,
      pdfReceiptFilename: payment.pdfReceiptFilename,
      pdfReceiptGeneratedAt: payment.pdfReceiptGeneratedAt,
      createdAt: payment.createdAt
    });
  } catch (err) {
    console.error('Error fetching payment receipt:', err);
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint to check all payments
router.get('/debug/all', async (req, res) => {
  try {
    const allPayments = await Payment.find({}).sort({ createdAt: -1 });
    console.log('All payments in system:', allPayments.length);
    
    const debugData = allPayments.map(payment => ({
      id: payment._id,
      user: payment.user,
      payerType: payment.payerType,
      status: payment.status,
      stripeStatus: payment.stripeStatus,
      pdfReceiptUrl: payment.pdfReceiptUrl,
      createdAt: payment.createdAt
    }));
    
    res.json({ 
      totalPayments: allPayments.length,
      payments: debugData 
    });
  } catch (err) {
    console.error('Error fetching all payments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cleanup orphaned payments (admin only)
router.delete('/cleanup-orphaned', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get all payments
    const allPayments = await Payment.find();
    let deletedCount = 0;
    let processedCount = 0;
    
    console.log(`Starting cleanup of ${allPayments.length} payments`);
    
    for (const payment of allPayments) {
      processedCount++;
      console.log(`Processing payment ${processedCount}/${allPayments.length}: ${payment._id}`);
      
      if (payment.user) {
        try {
          // Check if the user still exists
          const user = await User.findById(payment.user);
          if (!user) {
            // User doesn't exist, delete the payment
            await Payment.findByIdAndDelete(payment._id);
            deletedCount++;
            console.log(`Deleted orphaned payment ${payment._id} for deleted user ${payment.user}`);
          }
        } catch (err) {
          console.error(`Error checking user ${payment.user}:`, err);
          // If there's an error checking the user, delete the payment to be safe
          await Payment.findByIdAndDelete(payment._id);
          deletedCount++;
          console.log(`Deleted payment ${payment._id} due to error checking user ${payment.user}`);
        }
      } else {
        // If no user field, delete the payment as it's likely orphaned
        await Payment.findByIdAndDelete(payment._id);
        deletedCount++;
        console.log(`Deleted payment ${payment._id} with no user field`);
      }
    }
    
    console.log(`Cleanup completed: deleted ${deletedCount} orphaned payments out of ${allPayments.length} total`);
    res.json({ 
      message: `Cleanup completed: deleted ${deletedCount} orphaned payments out of ${allPayments.length} total`,
      deletedCount,
      totalProcessed: allPayments.length
    });
  } catch (err) {
    console.error('Error cleaning up orphaned payments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get payments with strict filtering (only payments with valid users)
router.get('/active-only', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get all payments
    const allPayments = await Payment.find().sort({ createdAt: -1 });
    console.log(`Total payments found: ${allPayments.length}`);
    
    // Only include payments with valid users
    const activePayments = [];
    let skippedCount = 0;
    
    for (const payment of allPayments) {
      if (payment.user) {
        try {
          // Check if the user still exists
          const user = await User.findById(payment.user);
          if (user) {
            activePayments.push(payment);
          } else {
            console.log(`Skipping payment ${payment._id} - user ${payment.user} not found`);
            skippedCount++;
          }
        } catch (err) {
          console.error(`Error checking user ${payment.user}:`, err);
          skippedCount++;
        }
      } else {
        // Skip payments without user field
        console.log(`Skipping payment ${payment._id} - no user field`);
        skippedCount++;
      }
    }
    
    console.log(`Strict filtering: ${allPayments.length} total payments to ${activePayments.length} active payments (skipped ${skippedCount})`);
    res.json(activePayments);
  } catch (err) {
    console.error('Error fetching active payments:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 