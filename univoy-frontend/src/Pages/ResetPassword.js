import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      await axios.get(`http://localhost:5001/api/auth/verify-reset-token/${token}`);
      setIsValidToken(true);
    } catch (err) {
      setAlert({
        open: true,
        message: 'Password reset link is invalid or has expired.',
        severity: 'error'
      });
    } finally {
      setIsCheckingToken(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords
    if (password !== confirmPassword) {
      setAlert({
        open: true,
        message: 'Passwords do not match',
        severity: 'error'
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setAlert({
        open: true,
        message: 'Password must be at least 6 characters long',
        severity: 'error'
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5001/api/auth/reset-password/${token}`, {
        password,
        confirmPassword
      });

      setAlert({
        open: true,
        message: response.data.message,
        severity: 'success'
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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

  if (isCheckingToken) {
    return (
      <div>
        <Header />
        <Box
          sx={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
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
              <CircularProgress sx={{ color: '#4CAF50', mb: 2 }} />
              <Typography variant="h6" color="#666">
                Verifying reset link...
              </Typography>
            </Paper>
          </Container>
        </Box>
        <Footer />
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div>
        <Header />
        <Box
          sx={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
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
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: '#ffebee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3
                }}
              >
                <Lock sx={{ fontSize: 40, color: '#f44336' }} />
              </Box>

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
                Invalid Reset Link
              </Typography>

              <Typography
                variant="body1"
                sx={{ 
                  mb: 4, 
                  color: '#666', 
                  textAlign: 'center'
                }}
              >
                The password reset link is invalid or has expired.
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#388E3C',
                  },
                  py: 1.5,
                  px: 3,
                  fontSize: '1.1rem'
                }}
              >
                Request New Reset Link
              </Button>
            </Paper>
          </Container>
        </Box>
        <Footer />
      </div>
    );
  }

  return (
    <div>
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
              <Lock sx={{ fontSize: 40, color: '#4CAF50' }} />
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
              Reset Password
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{ 
                mb: 4, 
                color: '#666', 
                textAlign: 'center'
              }}
            >
              Enter your new password below.
            </Typography>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                minLength="6"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ ...textFieldStyles, mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="confirmPassword"
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                minLength="6"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                  'Reset Password'
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

      <Footer />
    </div>
  );
};

export default ResetPassword; 