import React, { useState, useEffect } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Payment from './Student/Payment';
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Button,
  MenuItem,
  Avatar,
  Chip,
  Stack,
  Divider,
  CardMedia,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Email,
  Phone,
  School,
  Description,
  AccountBalance,
  Flag,
  LocationOn,
  AttachMoney,
  Event,
  CheckCircle,
  AccessTime,
  MonetizationOn,
  Discount,
} from "@mui/icons-material";
import axios from 'axios';
import { studentService } from '../Services/studentService';
import hertfordshireImage from "../assets/images/hertfordshire.png";
import defaultUniversityImage from "../assets/images/default.png";

const stripePromise = loadStripe('pk_test_51RbxmS02yyhrp9eeVoTJWmGq6co5eb9T3JDmU5NIbhGXhA29rLaGwpO5iSeKe1ijxiAep2DTImeFEhFkdJ6qzMKg00RUfjiQAg');

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const StudentProfile = () => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentService.getProfile();
        if (data) {
          setStudentProfile(data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!studentProfile) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography>No profile data available.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1.5,
        mb: 3,
        bgcolor: "#4CAF50",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      {/* Left Side: Avatar & User Info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Avatar */}
        {studentProfile?.profilePicture ? (
          <Avatar
            src={studentProfile.profilePicture}
            sx={{ width: 75, height: 75 }}
          />
        ) : (
          <Avatar
            sx={{ bgcolor: "#21502b", width: 75, height: 75, fontSize: 24 }}
          >
            {studentProfile?.firstName?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
        )}

        {/* User Details */}
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#214d23">
            {studentProfile?.firstName} {studentProfile?.lastName}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Flag sx={{ color: "#214d23" }} />
            <Typography color="#214d23">
              #{studentProfile?._id?.slice(-6).toUpperCase() || "N/A"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Email fontSize="small" sx={{ color: "#214d23" }} />
            <Typography variant="body2" color="#214d23">
              {studentProfile?.email || "Not provided"}
            </Typography>
            <Phone fontSize="small" sx={{ color: "#214d23" }} />
            <Typography variant="body2" color="#214d23">
              {studentProfile?.phone || "Not provided"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side: Icons */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button sx={{ color: "#214d23" }}>
          <School />
        </Button>
        <Button sx={{ color: "#214d23" }}>
          <Description />
        </Button>
        <Button sx={{ color: "#214d23" }}>
          <AccountBalance />
        </Button>
      </Box>
    </Box>
  );
};

const CourseSearch = ({ onApplicationSubmitted }) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [intake, setIntake] = useState("");
  const [destination, setDestination] = useState("");
  const [searched, setSearched] = useState(false);
  const [applications, setApplications] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // University image mapping
  const universityImages = {
    "hertfordshire": hertfordshireImage,
    "Hertfordshire-International-College": hertfordshireImage,
    "default": defaultUniversityImage
  };

  const getUniversityImage = (imageName) => {
    if (!imageName) return defaultUniversityImage;
    
    try {
      // If the image name starts with http or https, return it directly
      if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        return imageName;
      }
      
      // If the image name starts with /uploads/, it's a server-served image
      if (imageName.startsWith('/uploads/')) {
        return `http://localhost:5001${imageName}`;
      }
      
      // If the image name starts with /assets/, it's from the assets directory
      if (imageName.startsWith('/assets/')) {
        return `http://localhost:5001${imageName}`;
      }
      
      // For local images, use the mapping
      const key = imageName.split('.')[0].toLowerCase();
      if (universityImages[key]) {
        return universityImages[key];
      }
      
      // If no mapping found, try to load from assets directory
      return `http://localhost:5001/assets/images/${imageName}`;
    } catch (error) {
      console.error('Error getting image:', error);
      return defaultUniversityImage;
    }
  };

  useEffect(() => {
    // Load courses from API
    api.get('/api/courses')
      .then(response => {
        setCourses(response.data);
      })
      .catch(error => {
        console.error("Error fetching courses:", error);
        setSnackbarMessage("Error loading courses");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });

    // Load applications from backend
    api.get('/api/course-applications')
      .then(response => {
        const applicationsMap = {};
        response.data.forEach(app => {
          applicationsMap[app.courseId] = app;
        });
        setApplications(applicationsMap);
      })
      .catch(error => {
        console.error('Error fetching applications:', error);
      });
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim() && !intake && !destination) {
      setFilteredCourses([]);
      setSearched(true);
      return;
    }

    // Use the search API endpoint
    api.get('/api/courses/search', {
      params: {
        query: searchQuery,
        intake: intake,
        destination: destination
      }
    })
    .then(response => {
      setFilteredCourses(response.data);
      setSearched(true);
    })
    .catch(error => {
      console.error('Error searching courses:', error);
      setSnackbarMessage("Error searching courses");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    });
  };

  const handleApply = (universityId, universityData) => {
    if (!universityId) {
      setSnackbarMessage("Invalid course ID");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    if (applications[universityId]) {
      setSnackbarMessage("You have already applied to this university!");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    setSelectedUniversity({ universityId, universityData });
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedUniversity) return;
    try {
      const { universityId, universityData } = selectedUniversity;
      const response = await api.post('/api/course-applications', {
        courseId: universityId,
        universityData: {
          name: universityData.name || universityData.institution,
          title: universityData.title,
          location: universityData.location,
          tuition_fee: universityData.tuition_fee,
          intake: universityData.intake,
          duration: universityData.duration,
          image: universityData.image
        }
      });
      setApplications(prev => ({
        ...prev,
        [universityId]: response.data
      }));
      setSnackbarMessage("Application submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setPaymentDialogOpen(false);
      setSelectedUniversity(null);
      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error.response?.data?.message || "Error submitting application";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setPaymentDialogOpen(false);
      setSelectedUniversity(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ width: "100%", pt: "5px" }}>
      <StudentProfile />

      {/* Search Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "center" },
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        <TextField
          label="Search by Course Name"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 200,
            "& label.Mui-focused": { color: "#4CAF50" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#BDBDBD" },
              "&:hover fieldset": { borderColor: "#4caf50" },
              "&.Mui-focused fieldset": { borderColor: "#4caf50" },
            },
          }}
          InputProps={{
            startAdornment: <School color="action" sx={{ mr: 1 }} />,
          }}
        />

        <TextField
          select
          label="Intake"
          value={intake}
          onChange={(e) => setIntake(e.target.value)}
          sx={{
            minWidth: 150,
            "& label.Mui-focused": { color: "#4CAF50" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#BDBDBD" },
              "&:hover fieldset": { borderColor: "#4caf50" },
              "&.Mui-focused fieldset": { borderColor: "#4caf50" },
            },
          }}
          InputProps={{
            startAdornment: <Event color="action" sx={{ mr: 1 }} />,
          }}
        >
          <MenuItem value="September">September</MenuItem>
          <MenuItem value="January">January</MenuItem>
          <MenuItem value="May">May</MenuItem>
        </TextField>

        <TextField
          select
          label="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          sx={{
            minWidth: 150,
            "& label.Mui-focused": { color: "#4CAF50" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#BDBDBD" },
              "&:hover fieldset": { borderColor: "#4caf50" },
              "&.Mui-focused fieldset": { borderColor: "#4caf50" },
            },
          }}
          InputProps={{
            startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />,
          }}
        >
          <MenuItem value="United Kingdom">United Kingdom</MenuItem>
          <MenuItem value="United States">United States</MenuItem>
          <MenuItem value="Canada">Canada</MenuItem>
          <MenuItem value="Australia">Australia</MenuItem>
        </TextField>

        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            bgcolor: "#4caf50",
            color: "white",
            px: 3,
            height: "56px",
            "&:hover": { bgcolor: "#388e3c" },
          }}
        >
          Search
        </Button>
      </Box>

      {/* Results Section */}
      {searched && (
        <Box sx={{ width: "100%" }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "Course" : "Courses"} Found
          </Typography>

          {filteredCourses.length === 0 ? (
            <Typography
              textAlign="center"
              color="text.secondary"
              sx={{ mt: 4 }}
            >
              No courses match your search criteria. Try adjusting your filters.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                width: "100%",
              }}
            >
              {filteredCourses.map((course) => (
                <Box key={course.legacyId || course.id} sx={{ width: "100%" }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 3, width: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        width: "100%",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={getUniversityImage(course.image)}
                        alt={course.institution}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultUniversityImage;
                        }}
                        sx={{
                          width: { xs: "100%", md: 250 },
                          height: { xs: 180, md: "100%" },
                          objectFit: "cover",
                        }}
                      />
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {course.institution}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          color="text.secondary"
                          gutterBottom
                        >
                          {course.title}
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Stack spacing={1}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <LocationOn color="action" />
                                <Typography>{course.location}</Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <AttachMoney color="action" />
                                <Typography>
                                  Tuition Fee: {course.tuition_fee}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <MonetizationOn color="action" />
                                <Typography>
                                  Initial Required:{" "}
                                  {course["Initial Required"] || "N/A"}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Stack spacing={1}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Event color="action" />
                                <Typography>Intake: {course.intake}</Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <AccessTime color="action" />
                                <Typography>
                                  Duration: {course.duration}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Discount color="action" />
                                <Typography>
                                  Scholarship: {course.Scholarship || "N/A"}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          {course.post_study_work_visa === "Available" && (
                            <Chip
                              icon={<CheckCircle fontSize="small" />}
                              label="PSW Visa Available"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {course.gap_year_allowed && (
                            <Chip
                              label="Gap Year Accepted"
                              color="info"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {course.backlog_allowed && (
                            <Chip
                              label="Backlogs Accepted"
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {applications[course.legacyId] && (
                            <Chip
                              icon={<CheckCircle fontSize="small" />}
                              label="Applied"
                              color="success"
                              size="small"
                            />
                          )}
                        </Box>

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" component="div">
                            <strong>Requirements:</strong>{" "}
                          </Typography>
                          <Stack spacing={1}>
                            {Object.entries(course.admission_requirements).map(([test, score], index) => (
                              <Box
                                key={`${test}-${index}`}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">
                                  <strong>{test}:</strong> {score}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{
                              mt: 2,
                              mr: 2,
                              backgroundColor: applications[course.legacyId]
                                ? "#388e3c"
                                : "#4caf50",
                              "&:hover": {
                                backgroundColor: applications[course.legacyId]
                                  ? "#2e7d32"
                                  : "#388e3c",
                              },
                            }}
                            onClick={() =>
                              handleApply(course.legacyId, {
                                name: course.institution,
                                title: course.title,
                                location: course.location,
                                tuition_fee: course.tuition_fee,
                                intake: course.intake,
                                duration: course.duration,
                                image: course.image,
                              })
                            }
                            disabled={!!applications[course.legacyId]}
                          >
                            {applications[course.legacyId]
                              ? "Applied ✓"
                              : "Apply Now"}
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{
                              mt: 2,
                              color: "#4caf50",
                              border: "1px solid #4caf50",
                              "&:hover": {
                                backgroundColor: "#4caf50",
                                color: "#ffffff",
                              },
                            }}
                          >
                            View Detail
                          </Button>
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Application Fee Payment ($10)</DialogTitle>
        <DialogContent>
          {selectedUniversity && (
            <Elements stripe={stripePromise}>
              <Payment onPaymentSuccess={handlePaymentSuccess} applicationFee={10} />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CourseSearch;
