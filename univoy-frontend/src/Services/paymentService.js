import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const PAYMENTS_API_URL = `${API_URL}/api/payments`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const paymentService = {
  createPayment: async (paymentData) => {
    try {
      console.log('Creating payment:', paymentData);
      const res = await axios.post(PAYMENTS_API_URL, paymentData, {
        headers: getAuthHeaders()
      });
      console.log('Payment created successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },
  
  getPayments: async () => {
    try {
      console.log('Fetching all payments...');
      const res = await axios.get(PAYMENTS_API_URL, {
        headers: getAuthHeaders()
      });
      console.log('Payments fetched successfully:', res.data.length);
      return res.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },
  
  getActivePayments: async () => {
    try {
      console.log('Fetching active payments...');
      const res = await axios.get(`${PAYMENTS_API_URL}/active-only`, {
        headers: getAuthHeaders()
      });
      console.log('Active payments fetched successfully:', res.data.length);
      return res.data;
    } catch (error) {
      console.error('Error fetching active payments:', error);
      throw error;
    }
  },
  
  verifyPayment: async (id) => {
    try {
      console.log('Verifying payment with ID:', id);
      const res = await axios.patch(`${PAYMENTS_API_URL}/${id}/verify`, {}, {
        headers: getAuthHeaders()
      });
      console.log('Payment verified successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },
  
  resendReceipt: async (id) => {
    try {
      console.log('Resending receipt for payment ID:', id);
      const res = await axios.post(`${PAYMENTS_API_URL}/${id}/resend-receipt`, {}, {
        headers: getAuthHeaders()
      });
      console.log('Receipt resent successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error resending receipt:', error);
      throw error;
    }
  },
  
  getPaymentReceipts: async (userId) => {
    try {
      console.log('Fetching payment receipts for user ID:', userId);
      const res = await axios.get(`${PAYMENTS_API_URL}/receipts/${userId}`, {
        headers: getAuthHeaders()
      });
      console.log('Payment receipts fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching payment receipts:', error);
      throw error;
    }
  },
  
  getPaymentReceipt: async (paymentId) => {
    try {
      console.log('Fetching payment receipt for payment ID:', paymentId);
      const res = await axios.get(`${PAYMENTS_API_URL}/receipt/${paymentId}`, {
        headers: getAuthHeaders()
      });
      console.log('Payment receipt fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching payment receipt:', error);
      throw error;
    }
  },
  
  createPaymentIntent: async (amount) => {
    try {
      console.log('Creating payment intent for amount:', amount);
      const res = await axios.post(`${PAYMENTS_API_URL}/create-payment-intent`, { amount }, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Payment intent created successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },
  
  cleanupOrphanedPayments: async () => {
    try {
      console.log('Cleaning up orphaned payments...');
      const res = await axios.delete(`${PAYMENTS_API_URL}/cleanup-orphaned`, {
        headers: getAuthHeaders()
      });
      console.log('Orphaned payments cleanup completed:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error cleaning up orphaned payments:', error);
      throw error;
    }
  }
}; 