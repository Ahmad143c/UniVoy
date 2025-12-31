import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, CircularProgress, Snackbar, Tooltip, IconButton } from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { paymentService } from '../../Services/paymentService';

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use regular payments endpoint to avoid filtering issues
      const payments = await paymentService.getPayments();
      console.log('Fetched payments:', payments.length);
      setPayments(payments);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (id) => {
    setVerifyingPayment(id);
    try {
      console.log('Verifying payment:', id);
      const result = await paymentService.verifyPayment(id);
      console.log('Verification result:', result);
      console.log('Result structure:', {
        receiptSent: result.receiptSent,
        receiptNumber: result.receiptNumber,
        pdfReceiptUrl: result.pdfReceiptUrl,
        hasPayment: !!result.payment
      });
      setSuccess(`Payment verified successfully! Receipt ${result.receiptNumber ? `#${result.receiptNumber}` : ''} has been sent to the payer.`);
      
      // Update the payment in the local state immediately
      setPayments(prevPayments => {
        console.log('Current payments before update:', prevPayments.map(p => ({ id: p._id, status: p.status, receiptSent: p.receiptSent })));
        console.log('Looking for payment with ID:', id);
        console.log('Available payment IDs:', prevPayments.map(p => p._id));
        
        const updatedPayments = prevPayments.map(payment => {
          console.log(`Comparing payment._id (${payment._id}) with id (${id}):`, payment._id === id);
          // Try both string comparison and ObjectId comparison
          const isMatch = payment._id === id || payment._id.toString() === id.toString();
          console.log(`Is match: ${isMatch}`);
          
          if (isMatch) {
            console.log('Found matching payment, updating...');
            console.log('Updating payment with result data:', {
              receiptSent: result.receiptSent,
              receiptNumber: result.receiptNumber,
              pdfReceiptUrl: result.pdfReceiptUrl
            });
            
            return {
              ...payment,
              status: 'Verified',
              receiptSent: result.receiptSent !== undefined ? result.receiptSent : true,
              receiptSentAt: result.receiptSentAt || new Date().toISOString(),
              receiptNumber: result.receiptNumber,
              pdfReceiptUrl: result.pdfReceiptUrl,
              pdfReceiptFilename: result.pdfReceiptFilename,
              pdfReceiptGeneratedAt: result.pdfReceiptGeneratedAt
            };
          }
          return payment;
        });
        
        console.log('Updated payments after update:', updatedPayments.map(p => ({ id: p._id, status: p.status, receiptSent: p.receiptSent })));
        
        // Check if any payment was actually updated
        const wasUpdated = updatedPayments.some(p => p._id === id || p._id.toString() === id.toString());
        console.log('Was payment updated?', wasUpdated);
        
        if (!wasUpdated) {
          console.warn('Payment was not found in the current list, this might indicate a filtering issue');
        }
        
        return updatedPayments;
      });
      
      // Also fetch fresh data to ensure consistency
      setTimeout(() => {
        fetchPayments();
      }, 1000);
    } catch (err) {
      setError('Failed to verify payment.');
    } finally {
      setVerifyingPayment(null);
    }
  };

  const handleResendReceipt = async (id) => {
    try {
      console.log('Resending receipt for payment ID:', id);
      setSuccess('Sending receipt...');
      
      const result = await paymentService.resendReceipt(id);
      
      if (result.success) {
        setSuccess(`Receipt #${result.receiptNumber} has been sent successfully to the payer.`);
        
        // Update the payment in the local state immediately
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment._id === id 
              ? {
                  ...payment,
                  receiptSent: true,
                  receiptSentAt: new Date().toISOString(),
                  receiptNumber: result.receiptNumber,
                  receiptError: null
                }
              : payment
          )
        );
        
        // Also fetch fresh data to ensure consistency
        setTimeout(() => {
          fetchPayments();
        }, 1000);
      } else {
        // Handle specific error cases
        let errorMessage = result.error || 'Unknown error';
        
        if (result.requiresSetup) {
          errorMessage = 'Email configuration error. Please check Gmail app password settings. See GMAIL_SETUP_GUIDE.md for instructions.';
        } else if (result.error && result.error.includes('Email configuration error')) {
          errorMessage = result.error;
        }
        
        setError(errorMessage);
        console.error('Receipt resend failed:', result);
      }
    } catch (err) {
      console.error('Error resending receipt:', err);
      
      // Handle network errors or other exceptions
      let errorMessage = 'Failed to send receipt';
      if (err.response && err.response.data) {
        const responseData = err.response.data;
        if (responseData.requiresSetup) {
          errorMessage = 'Email configuration error. Please check Gmail app password settings. See GMAIL_SETUP_GUIDE.md for instructions.';
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      } else if (err.message) {
        errorMessage = `Network error: ${err.message}`;
      }
      
      setError(errorMessage);
    }
  };

  // Split payments by type
  const studentPayments = payments.filter(p => p.payerType === 'Student' && p.stripeStatus === 'succeeded');
  const consultantPayments = payments.filter(p => p.payerType === 'Consultant' && p.stripeStatus === 'succeeded');

  const renderTable = (data, type) =>
    <TableContainer sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: type === 'Student' ? '#388e3c' : '#635bff', mb: 1, mt: 2 }}>
        {type} Payments
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Name</b></TableCell>
            <TableCell><b>Email</b></TableCell>
            <TableCell><b>Amount ($)</b></TableCell>
            <TableCell><b>Status</b></TableCell>
            <TableCell><b>Receipt</b></TableCell>
            <TableCell><b>Action</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow><TableCell colSpan={6} align="center">No {type.toLowerCase()} payments found.</TableCell></TableRow>
          ) : (
            data.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>{payment.name}</TableCell>
                <TableCell>{payment.email}</TableCell>
                <TableCell>
                  <Chip label={`$${payment.amount}`} color="success" sx={{ fontWeight: 'bold' }} />
                </TableCell>
                <TableCell>
                  {payment.receiptSent ? (
                    <Tooltip title={`Receipt #${payment.receiptNumber} sent on ${new Date(payment.receiptSentAt).toLocaleDateString()}`}>
                      <Chip 
                        icon={<ReceiptIcon />} 
                        label="Sent" 
                        color="success" 
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                  ) : (
                    <Chip 
                      label="Pending" 
                      color="warning" 
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {payment.status === 'Pending' ? (
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small" 
                      onClick={() => handleVerify(payment._id)}
                      disabled={verifyingPayment === payment._id}
                      startIcon={verifyingPayment === payment._id ? <CircularProgress size={16} /> : null}
                    >
                      {verifyingPayment === payment._id ? 'Verifying...' : 'Verify'}
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                      <Chip label="Verified" color="success" size="small" />
                      {/* Always check for pdfReceiptUrl after update/refetch */}
                      {(!!payment.pdfReceiptUrl) ? (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View PDF Receipt">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const baseUrl = process.env.REACT_APP_API_URL?.split('/api')[0] || 'http://localhost:5001';
                                window.open(`${baseUrl}${payment.pdfReceiptUrl}`, '_blank');
                              }}
                              sx={{ color: '#4CAF50', p: 0.5 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF Receipt">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const baseUrl = process.env.REACT_APP_API_URL?.split('/api')[0] || 'http://localhost:5001';
                                const fullUrl = `${baseUrl}${payment.pdfReceiptUrl}`;
                                const link = document.createElement('a');
                                link.href = fullUrl;
                                link.download = payment.pdfReceiptFilename || `receipt_${payment.receiptNumber}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              sx={{ color: '#4CAF50', p: 0.5 }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Receipt not yet generated. Please wait or refresh.
                        </Typography>
                      )}
                      <Button 
                        variant="outlined" 
                        color={payment.receiptSent ? "primary" : "warning"}
                        size="small" 
                        onClick={() => handleResendReceipt(payment._id)}
                        startIcon={<ReceiptIcon />}
                      >
                        {payment.receiptSent ? "Resend" : "Send Receipt"}
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  ;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PaymentIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#22502C" }}>
            Received Payments
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {/* Info Alert */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2, border: '1px solid #2196f3' }}>
          <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon fontSize="small" />
            <strong>Automatic Receipt Generation:</strong> When you verify a payment, a professional receipt will be automatically generated and sent to the payer's email address.
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {renderTable(studentPayments, 'Student')}
            {renderTable(consultantPayments, 'Consultant')}
          </>
        )}
        
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
          <MuiAlert elevation={6} variant="filled" onClose={() => setError('')} severity="error">
            {error}
          </MuiAlert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={5000} onClose={() => setSuccess('')}>
          <MuiAlert elevation={6} variant="filled" onClose={() => setSuccess('')} severity="success">
            {success}
          </MuiAlert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Payment; 