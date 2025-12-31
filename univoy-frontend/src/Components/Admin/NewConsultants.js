import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";

const NewConsultants = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token); // Debug log
      
      if (!token) {
        setSnackbar({
          open: true,
          message: "Authentication token not found. Please log in again.",
          severity: "error",
        });
        return;
      }

      console.log("Sending request with data:", formData); // Debug log
      
      const response = await axios.post(
        "http://localhost:5001/api/consultants",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response received:", response.data); // Debug log

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        experience: "",
      });

      // Show success message
      setSnackbar({
        open: true,
        message: "Consultant added successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Full error object:", error); // Debug log
      console.error("Error response:", error.response); // Debug log
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error adding consultant. Please check console for details.",
        severity: "error",
      });
    }
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#4CAF50",
      },
      "&:hover fieldset": {
        borderColor: "#388E3C",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#4CAF50",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#25502D",
      "&.Mui-focused": {
        color: "#4CAF50",
      },
    },
    "& .MuiInputBase-input": {
      color: "#25502D",
    },
  };

  const buttonStyles = {
    color: "#ffff",
    backgroundColor: "#4CAF50",
    "&:hover": { backgroundColor: "#388E3C" },
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add New Consultant
      </Typography>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Experience (years)"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                sx={textFieldStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ ...buttonStyles, mt: 2 }}
              >
                Add Consultant
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewConsultants; 