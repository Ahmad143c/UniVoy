import React, { useState } from "react";
import { Box, Paper, Typography, Button, Divider, Chip, Stack, TextField } from "@mui/material";
import PaymentIcon from '@mui/icons-material/Payment';
import LockIcon from '@mui/icons-material/Lock';
import { paymentService } from '../../Services/paymentService';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const Payment = () => {
  const [amount, setAmount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  console.log('Consultant currentUser:', currentUser);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Create PaymentIntent
      const { clientSecret } = await paymentService.createPaymentIntent(amount);
      // 2. Confirm card payment
      const cardElement = elements.getElement(CardElement);
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: currentUser?.firstName + ' ' + currentUser?.lastName,
            email: currentUser?.email,
          },
        },
      });
      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }
      if (paymentIntent.status === 'succeeded') {
        // 3. Record payment in backend
        await paymentService.createPayment({
          payerType: 'Consultant',
          name: (currentUser?.firstName && currentUser?.lastName)
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : (currentUser?.email || 'Unknown'),
          email: currentUser?.email,
          amount: Number(amount),
          status: 'Pending',
          user: currentUser?._id || currentUser?.id,
          stripeStatus: 'succeeded'
        });
        setSuccess(true);
      } else {
        setError('Payment was not successful.');
      }
    } catch (err) {
      setError('Payment could not be processed.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Stack alignItems="center" spacing={2}>
          <PaymentIcon sx={{ fontSize: 60, color: '#4CAF50' }} />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#22502C" }}>
            Consultant Payment to Admin
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
          Enter the payment amount according to the commission received. Payment is secure and powered by Stripe.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <TextField
            label="Amount ($)"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputProps={{ min: 0, step: 1 }}
            sx={{ width: 200, fontWeight: 'bold', background: '#c8e6c9', borderRadius: 2 }}
            required
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#635bff', letterSpacing: 2, fontFamily: 'monospace' }}>
            Stripe
          </Typography>
        </Box>
        <form onSubmit={handlePayment}>
          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
            <CardElement
              options={{ style: { base: { fontSize: '18px', color: '#22502C' } } }}
              onChange={e => setCardComplete(e.complete)}
            />
          </Box>
          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{ fontWeight: "bold", py: 1.5, fontSize: 18, mb: 2, boxShadow: 2, '&:hover': { background: '#388e3c' } }}
            startIcon={<LockIcon />}
            type="submit"
            disabled={!stripe || !elements || !cardComplete || loading || amount <= 0}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay Securely'}
          </Button>
        </form>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
          Payments are processed securely. For support, contact <a href="mailto:univoy780@gmail.com">univoy780@gmail.com</a>.
        </Typography>
      </Paper>
      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setSuccess(false)} severity="success">
          Payment successful!
        </MuiAlert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setError('')} severity="error">
          {error}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Payment; 