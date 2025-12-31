import React, { useState } from "react";
import Footer from "../Components/Footer";
import Header from "../Components/Header";
import { Container, Box, Typography, TextField, Button, Paper, InputAdornment, IconButton, Alert, Snackbar, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleAuth } from "../Services/authService";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import image3 from "../assets/images/image3.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Handle Login Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        
        // Show success message based on user role
        const roleMessage = {
          student: "Welcome to Student Dashboard",
          admin: "Welcome to Admin Dashboard",
          consultant: "Welcome to Consultant Dashboard"
        };
        
        setAlert({
          open: true,
          message: roleMessage[response.user.role] || "Welcome!",
          severity: "success",
        });

        // Redirect based on user role
        setTimeout(() => {
          switch (response.user.role) {
            case "student":
              navigate("/student-dashboard");
              break;
            case "admin":
              navigate("/admin-dashboard");
              break;
            case "consultant":
              navigate("/consultant-dashboard");
              break;
            default:
              navigate("/");
          }
        }, 1000);
      }
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.message || "Login failed. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await googleAuth(credentialResponse.credential);
      
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("currentUser", JSON.stringify(response.user));
        
        // Show success message based on user role
        const roleMessage = {
          student: "Welcome to Student Dashboard",
          admin: "Welcome to Admin Dashboard",
          consultant: "Welcome to Consultant Dashboard"
        };
        
        setAlert({
          open: true,
          message: roleMessage[response.user.role] || "Google login successful!",
          severity: "success",
        });

        // Redirect based on user role
        setTimeout(() => {
          switch (response.user.role) {
            case "student":
              navigate("/student-dashboard");
              break;
            case "admin":
              navigate("/admin-dashboard");
              break;
            case "consultant":
              navigate("/consultant-dashboard");
              break;
            default:
              navigate("/");
          }
        }, 1000);
      }
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.message || "Google login failed. Please try again.",
        severity: "error",
      });
    }
  };

  const handleGoogleError = () => {
    setAlert({
      open: true,
      message: "Google login failed. Please try again.",
      severity: "error",
    });
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
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "white",
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{ mb: 3, color: "#25502D", fontWeight: "bold" }}
            >
              Login
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                sx={{ ...textFieldStyles, mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: "#4CAF50",
                  "&:hover": {
                    backgroundColor: "#388E3C",
                  },
                }}
              >
                Sign In
              </Button>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="100%"
                />
              </Box>
              
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/forgot-password")}
                sx={{ color: "#666", mb: 1 }}
              >
                Forgot Password?
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/signup")}
                sx={{ color: "#4CAF50" }}
              >
                Don't have an account? Sign Up
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Login;
