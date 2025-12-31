import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Divider, Chip, Button, CircularProgress, Stack } from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import { paymentService } from '../../Services/paymentService';

const PaymentReceipt = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const allPayments = await paymentService.getPayments();
        // Filter receipts for logged-in student by user id or email
        const userReceipts = allPayments.filter(p =>
          (p.user && p.user === currentUser?.id) ||
          (p.email && p.email === currentUser?.email)
        );
        setReceipts(userReceipts);
      } catch (err) {
        setReceipts([]);
      }
      setLoading(false);
    };
    fetchReceipts();
  }, [currentUser]);

  const handleDownload = (receiptUrl) => {
    window.open(receiptUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Stack alignItems="center" spacing={2}>
          <ReceiptIcon sx={{ fontSize: 60, color: '#4CAF50' }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#22502C" }}>
            Payment Receipts
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {loading ? (
          <Box textAlign="center" py={4}><CircularProgress /></Box>
        ) : receipts.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">No payment receipts found.</Typography>
        ) : (
          <Box>
            {receipts.map((receipt, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip label={`$${receipt.amount}`} color="success" />
                  <Typography variant="body1" sx={{ flex: 1 }}>
                    {receipt.name} ({receipt.email})<br />
                    <span style={{ color: '#388e3c' }}>{receipt.status}</span>
                  </Typography>
                  {receipt.receiptUrl && (
                    <Button variant="outlined" color="success" onClick={() => handleDownload(receipt.receiptUrl)}>
                      Download Receipt
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentReceipt;
