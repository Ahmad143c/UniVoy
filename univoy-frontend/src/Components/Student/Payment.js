import React from "react";
import { Box, Paper, Typography, Button, Divider, Chip, Stack } from "@mui/material";
import PaymentIcon from '@mui/icons-material/Payment';
import LockIcon from '@mui/icons-material/Lock';
import { paymentService } from '../../Services/paymentService';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// APPLICATION_FEE removed, now passed as prop

const Payment = ({ onPaymentSuccess, applicationFee = 10 }) => {
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [cardComplete, setCardComplete] = React.useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Create PaymentIntent
  const { clientSecret } = await paymentService.createPaymentIntent(applicationFee);
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
        const paymentPayload = {
          payerType: 'Student',
          name: currentUser?.firstName && currentUser?.lastName
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : currentUser?.email || 'Unknown',
          email: currentUser?.email,
          amount: applicationFee,
          status: 'Pending',
          user: currentUser?._id || currentUser?.id,
          stripeStatus: 'succeeded'
        };
        console.log('Payment payload:', paymentPayload);
        await paymentService.createPayment(paymentPayload);
        setSuccess(true);
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
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
            Application Fee Payment
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
          You are about to pay the application fee to <b>UniVoy Admin</b>.<br/>
          Payment is secure and powered by Stripe.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Chip label={`Fee: $${applicationFee}`} color="success" sx={{ fontSize: 24, p: 3, fontWeight: 'bold', background: '#c8e6c9', color: '#22502C', boxShadow: 2, letterSpacing: 1, minWidth: 180, height: 48 }} />
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
            disabled={!stripe || !elements || !cardComplete || loading}
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