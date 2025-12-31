import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Email } from '@mui/icons-material';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', {
        email
      });

      setAlert({
        open: true,
        message: response.data.message,
        severity: 'success'
      });
      setEmail('');
    } catch (err) {
      setAlert({
        open: true,
        message: err.response?.data?.message || 'An error occurred. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const textFieldStyles = {
    "& label.Mui-focused": { color: "#4CAF50" },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": { borderColor: "#4CAF50" },
    },
  };

  return (
    <div>
      {/* Header */}
      <Header />

      <Box
        sx={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          py: 4
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: 2
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#e8f5e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <Email sx={{ fontSize: 40, color: '#4CAF50' }} />
            </Box>

            {/* Title */}
            <Typography
              component="h1"
              variant="h4"
              sx={{ 
                mb: 2, 
                color: '#25502D', 
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Forgot Password
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{ 
                mb: 4, 
                color: '#666', 
                textAlign: 'center',
                maxWidth: 400
              }}
            >
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                sx={{ ...textFieldStyles, mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  mb: 3,
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#388E3C',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                  },
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              {/* Back to Login Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    color: '#666',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#4CAF50'
                    }
                  }}
                >
                  Remember your password? Back to Login
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ForgotPassword; 