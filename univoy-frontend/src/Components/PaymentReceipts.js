import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { paymentService } from '../Services/paymentService';

const PaymentReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        setError('User information not found');
        return;
      }

      // Check for user ID in both _id and id fields
      const userId = currentUser._id || currentUser.id;
      if (!userId) {
        setError('User ID not found');
        return;
      }

      console.log('Fetching receipts for user ID:', userId);
      const response = await paymentService.getPaymentReceipts(userId);
      console.log('Receipts response:', response);
      setReceipts(response.receipts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Failed to load payment receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (receipt) => {
    const baseUrl = process.env.REACT_APP_API_URL?.split('/api')[0] || 'http://localhost:5001';
    const fullUrl = `${baseUrl}${receipt.pdfReceiptUrl}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadReceipt = (receipt) => {
    const baseUrl = process.env.REACT_APP_API_URL?.split('/api')[0] || 'http://localhost:5001';
    const fullUrl = `${baseUrl}${receipt.pdfReceiptUrl}`;
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = receipt.pdfReceiptFilename || `receipt_${receipt.receiptNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReceiptStatusColor = (payerType) => {
    return payerType === 'Student' ? 'success' : 'primary';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchReceipts}
          sx={{ bgcolor: '#4CAF50' }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <ReceiptIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#22502C" }}>
            Payment Receipts
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {receipts.length === 0 ? (
          <Box textAlign="center" py={4}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Payment Receipts Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment receipts will appear here once your payments are verified by admin.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {receipts.map((receipt) => (
              <Grid item xs={12} md={6} lg={4} key={receipt.id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      borderColor: '#4CAF50'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PaymentIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22502C' }}>
                        Receipt #{receipt.receiptNumber}
                      </Typography>
                      <Chip
                        label={receipt.payerType}
                        color={getReceiptStatusColor(receipt.payerType)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      ${receipt.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment Date: {new Date(receipt.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generated: {new Date(receipt.pdfReceiptGeneratedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Receipt">
                      <IconButton
                        onClick={() => handleViewReceipt(receipt)}
                        sx={{
                          color: '#4CAF50',
                          border: '1px solid #4CAF50',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.1)'
                          }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Download Receipt">
                      <IconButton
                        onClick={() => handleDownloadReceipt(receipt)}
                        sx={{
                          color: '#4CAF50',
                          border: '1px solid #4CAF50',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.1)'
                          }
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Card>
    </Box>
  );
};

export default PaymentReceipts; 