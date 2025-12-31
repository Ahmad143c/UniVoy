import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Snackbar,
  Alert
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { studentService } from '../Services/studentService';
import api, { API_URL } from '../Services/api';

const steps = ["Personal Details", "Education Details", "Upload Documents"];

const StudentForm = ({ onClose = () => { } }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationality: "",
    residenceCountry: "",
    phone: "",
    email: "",
    educationLevel: "",
    completionYear: "",
    educationCountry: "",
    obtainedMarksAndCgpa: "",
    totalMarksAndCgpa: "",
    preferredCountries: [],
    documents: {
      transcript: null,
      passport: null,
      englishTest: null,
      resume: null,
      referenceletter: null,
      experienceletter: null,
    }
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const inputStyles = {
    "& label.Mui-focused": { color: "#4CAF50" },
    "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#4CAF50" } },
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentService.getProfile();
        if (data) {
          setFormData({
            ...data,
            documents: data.documents || {
              transcript: null,
              passport: null,
              englishTest: null,
              resume: null,
              referenceletter: null,
              experienceletter: null,
            }
          });
        }
      } catch (error) {
        // If it's a 404 error, it means the profile doesn't exist yet
        if (error.response?.status === 404) {
          // Initialize form with current user's email
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (currentUser) {
            setFormData(prev => ({
              ...prev,
              email: currentUser.email
            }));
          }
        } else {
          console.error('Error fetching profile:', error);
          setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Error loading profile data. Please try again later.',
            severity: 'error'
          });
        }
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'preferredCountries') {
      setFormData({ ...formData, preferredCountries: [e.target.value] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'File size too large. Maximum size is 10MB.',
        severity: 'error'
      });
      return;
    }

    // Validate file type
    const allowedTypes = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/i;
    if (!file.name.match(allowedTypes)) {
      setSnackbar({
        open: true,
        message: 'Invalid file type. Only images and documents are allowed.',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Upload response:', response.data); // Debug log

      if (!response.data || !response.data.url) {
        throw new Error('Invalid response from server');
      }

      // Construct the full URL
      const baseUrl = API_URL.split('/api')[0]; // Get the base URL without /api
      const fileUrl = `${baseUrl}${response.data.url}`;
      
      console.log('Constructed file URL:', fileUrl); // Debug log

      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [e.target.name]: {
            url: fileUrl,
            name: file.name
          }
        }
      }));

      setSnackbar({
        open: true,
        message: 'File uploaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          'Error uploading file. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Upload response:', response.data); // Debug log

      if (!response.data || !response.data.url) {
        throw new Error('Invalid response from server');
      }

      // Construct the full URL
      const baseUrl = API_URL.split('/api')[0]; // Get the base URL without /api
      const imageUrl = `${baseUrl}${response.data.url}`;
      
      console.log('Constructed image URL:', imageUrl); // Debug log

      setFormData(prev => ({
        ...prev,
        profilePicture: imageUrl
      }));

      setSnackbar({
        open: true,
        message: 'Profile picture uploaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          'Error uploading profile picture';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleNext = async () => {
    const requiredFields = {
      0: ["firstName", "lastName", "nationality", "residenceCountry", "phone", "email", "preferredCountries"],
      1: ["educationLevel", "completionYear", "educationCountry", "obtainedMarksAndCgpa", "totalMarksAndCgpa"],
      2: ["documents"],
    };

    const emptyFields = requiredFields[activeStep].filter((field) => {
      if (field === 'preferredCountries') {
        return !formData.preferredCountries || !formData.preferredCountries[0];
      }
      if (field === 'completionYear') {
        return !formData.completionYear || formData.completionYear.trim() === '';
      }
      return !formData[field];
    });

    if (emptyFields.length > 0) {
      setSnackbar({
        open: true,
        message: `Please fill in the required fields: ${emptyFields.join(", ")}`,
        severity: 'error'
      });
      return;
    }

    if (activeStep === steps.length - 1) {
      try {
        await studentService.updateProfile(formData);
        setSnackbar({
          open: true,
          message: 'Profile saved successfully',
          severity: 'success'
        });
        onClose();
      } catch (error) {
        console.error('Error saving profile:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.msg || 'Error saving profile',
          severity: 'error'
        });
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box sx={overlayStyle}>
        <Container component={Paper} elevation={6} sx={formContainer}>
          <IconButton onClick={onClose} sx={closeButtonStyle}>
            <CloseIcon />
          </IconButton>

          <Typography variant="h5" align="center" gutterBottom sx={{ color: "#00000" }}>
            Complete Your Profile
          </Typography>

          <Stepper activeStep={activeStep} sx={{ marginBottom: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={stepperStyles}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <>
              {/* Profile Picture Upload */}
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                {/* Profile Upload - Left Side */}
                <label htmlFor="profile-picture-upload">
                  <Paper
                    elevation={3}
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "2px dashed #4CAF50",
                      backgroundColor: "#FAFAFA",
                      transition: "background-color 0.3s ease-in-out",
                      marginRight: 2,
                      marginTop: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Show Avatar if an image is uploaded */}
                    <Avatar
                      src={formData.profilePicture}
                      sx={{ width: 120, height: 120, color: "#4CAF50", backgroundColor: "#C8E6C9", }}
                    />

                    {/* Hover overlay for "Add Photo" */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.3s ease-in-out",
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#FFF", fontWeight: "bold" }}>
                        {formData.profilePicture ? "Add Photo" : "Add Photo"}
                      </Typography>
                    </Box>

                    {/* Hover overlay for Edit/Delete options */}
                    {formData.profilePicture && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.3s ease-in-out",
                          "&:hover": { opacity: 1 },
                        }}
                      >
                        <Button
                          size="small"
                          sx={{ color: "#ffff" }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents click event from reaching the label
                            setFormData((prev) => ({ ...prev, profilePicture: null }));
                          }}
                        >
                          Edit Picture
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </label>

                {/* File Input (Hidden) */}
                <input
                  type="file"
                  accept="image/*"
                  id="profile-picture-upload"
                  style={{ display: "none" }}
                  onChange={handleProfilePictureChange}
                />

                {/* Name Fields - Right Side */}
                <Box sx={{ display: "flex", gap: 2, flex: 1, mt: -7 }}>
                  <TextField label="First Name" name="firstName" fullWidth margin="normal" onChange={handleChange} value={formData.firstName} required sx={inputStyles} />
                  <TextField label="Last Name" name="lastName" fullWidth margin="normal" onChange={handleChange} value={formData.lastName} required sx={inputStyles} />
                </Box>
              </Box>

              {/* Email Field - Next Row, Aligned with Profile */}
              <Box sx={{ display: "flex", alignItems: "center", mt: -7 }}>
                <Box sx={{ width: 120, marginRight: 5.2 }} /> {/* Spacer for alignment */}
                <TextField label="Email" name="email" fullWidth margin="normal" onChange={handleChange} value={formData.email} required sx={inputStyles} />
              </Box>

              {/* Phone, Residence Country, and Nationality Fields */}
              <TextField label="Phone" name="phone" fullWidth margin="normal" onChange={handleChange} value={formData.phone} required sx={inputStyles} />

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="Residence Country" name="residenceCountry" fullWidth margin="normal" onChange={handleChange} value={formData.residenceCountry} required sx={inputStyles} />
                <TextField label="Nationality" name="nationality" fullWidth margin="normal" onChange={handleChange} value={formData.nationality} required sx={inputStyles} />
              </Box>
              <TextField
                label="Preferred Country"
                name="preferredCountries"
                fullWidth
                margin="normal"
                onChange={handleChange}
                value={formData.preferredCountries[0] || ''}
                required
                sx={inputStyles}
              />
            </>
          )}

          {activeStep === 1 && (
            <>
              {["educationLevel", "completionYear", "educationCountry", "obtainedMarksAndCgpa", "totalMarksAndCgpa"].map(
                (field) => (
                  <TextField
                    key={field}
                    label={field
                      .replace(/([A-Z])/g, " $1") // Add spaces before uppercase letters
                      .replace(/^./, (str) => str.toUpperCase())} // Capitalize the first letter
                    name={field}
                    fullWidth
                    margin="normal"
                    onChange={handleChange}
                    value={formData[field]}
                    required
                    sx={inputStyles}
                  />
                )
              )}
            </>
          )}

          {activeStep === 2 && (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ color: "#4CAF50" }}>
                Upload Required Documents
              </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                {[
                  { name: "transcript", label: "Academic Transcript" },
                  { name: "englishTest", label: "English Test Certificate" },
                  { name: "experienceletter", label: "Experience letter" },
                  { name: "resume", label: "Resume" },
                  { name: "passport", label: "Passport" },
                  { name: "referenceletter", label: "Reference letter" },
                ].map((item) => (
                  <label key={item.name} htmlFor={`upload-${item.name}`}>
                    <input
                      type="file"
                      name={item.name}
                      id={`upload-${item.name}`}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    <Paper
                      elevation={2}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 1,
                        border: "2px dashed #4CAF50",
                        backgroundColor: formData.documents[item.name] ? "#E8F5E9" : "#FAFAFA",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease-in-out",
                        "&:hover": { backgroundColor: "#C8E6C9" },
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 30, color: "#4CAF50" }} />
                      <Typography variant="body2" color="textSecondary">
                        {formData.documents[item.name]?.name || `Upload ${item.label}`}
                      </Typography>
                    </Paper>
                  </label>
                ))}
              </Box>
              
            </>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            {activeStep > 0 && (
              <Button variant="outlined" onClick={handleBack} sx={buttonStyles}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              sx={buttonStyles}
            >
              {activeStep < steps.length - 1 ? "Next" : "Finish"}
            </Button>
          </Box>
        </Container>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// 🔹 Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
};

const formContainer = {
  width: { xs: "90%", md: "40%" },
  padding: 4,
  backgroundColor: "#fff",
  borderRadius: 2,
  position: "relative",
};

const closeButtonStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  color: "#4CAF50",
};

const stepperStyles = {
  "& .Mui-active": { color: "#4CAF50 !important" },
  "& .Mui-completed": { color: "#4CAF50 !important" },
};

const buttonStyles = {
  color: "#ffff",
  backgroundColor: "#4CAF50",
  "&:hover": { backgroundColor: "#388E3C" },
};

export default StudentForm;
