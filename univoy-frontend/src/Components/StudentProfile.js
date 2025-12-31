import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  Button,
  Snackbar,
  Alert,
  Grid,
  Paper,
  Chip,
  Fade
} from "@mui/material";
import {
  Assignment,
  School,
  Edit,
  School as SchoolIcon,
  CalendarToday,
  Public,
  Score,
  Grade,
  Description
} from "@mui/icons-material";
import { studentService } from '../Services/studentService';
import { API_URL } from '../Services/api';

const StudentProfile = ({ onEdit }) => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [universityDocuments, setUniversityDocuments] = useState([]);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [showTask1, setShowTask1] = useState(false);
  const [showTask2, setShowTask2] = useState(false);
  const [showTask3, setShowTask3] = useState(false);

  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;

    const requiredFields = {
      personal: [
        'firstName',
        'lastName',
        'email',
        'phone',
        'nationality',
        'residenceCountry'
      ],
      academic: [
        'educationLevel',
        'completionYear',
        'educationCountry',
        'obtainedMarksAndCgpa',
        'totalMarksAndCgpa'
      ],
      documents: [
        'transcript',
        'passport',
        'englishTest',
        'resume',
        'referenceletter',
        'experienceletter'
      ]
    };

    let totalFields = 0;
    let completedFields = 0;

    // Check personal information
    requiredFields.personal.forEach(field => {
      totalFields++;
      if (profile[field]) completedFields++;
    });

    // Check academic information
    requiredFields.academic.forEach(field => {
      totalFields++;
      if (profile[field]) completedFields++;
    });

    // Check documents
    requiredFields.documents.forEach(field => {
      totalFields++;
      if (profile.documents && profile.documents[field]) completedFields++;
    });

    // Calculate percentage
    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    return completionPercentage;
  };
    // Animation effect for percentage
    useEffect(() => {
      if (studentProfile && studentProfile.profileCompletion !== undefined) {
        const targetPercentage = studentProfile.profileCompletion;
        const duration = 1500; // 1.5 seconds
        const steps = 60; // 60 steps for smooth animation
        const increment = targetPercentage / steps;
        const stepDuration = duration / steps;
  
        let currentPercentage = 0;
        const timer = setInterval(() => {
          currentPercentage += increment;
          if (currentPercentage >= targetPercentage) {
            setAnimatedPercentage(targetPercentage);
            clearInterval(timer);
          } else {
            setAnimatedPercentage(Math.round(currentPercentage));
          }
        }, stepDuration);
  
        return () => clearInterval(timer);
      }
    }, [studentProfile]);
  
    // Show tasks one by one with delays
    useEffect(() => {
      if (studentProfile) {
        // First task appears after 1 second
        const timer1 = setTimeout(() => {
          setShowTask1(true);
        }, 1000);
  
        // Second task appears after 1.5 seconds
        const timer2 = setTimeout(() => {
          setShowTask2(true);
        }, 1500);
  
        // Third task appears after 2 seconds
        const timer3 = setTimeout(() => {
          setShowTask3(true);
        }, 2000);
  
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
        };
      }
    }, [studentProfile]);
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentService.getProfile();
        if (data) {
          // Calculate completion percentage
          const completionPercentage = calculateProfileCompletion(data);
          // Add completion percentage to profile data
          const profileWithCompletion = {
            ...data,
            profileCompletion: completionPercentage
          };
          setStudentProfile(profileWithCompletion);
        }
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // Profile not found, trigger form to show (do not log error)
          onEdit();
          return;
        }
        // Only log errors that are not 404
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [onEdit]);

  useEffect(() => {
    const fetchUniversityDocs = async () => {
      try {
        // Get the student profile to get the student _id
        const profile = await studentService.getProfile();
        if (!profile || !profile._id) return;
        const docs = await studentService.getUniversityDocuments(profile._id);
        setUniversityDocuments(docs || []);
      } catch (err) {
        setUniversityDocuments([]);
      }
    };
    fetchUniversityDocs();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2, bgcolor: "#4CAF50" }}
          onClick={onEdit}
        >
          Complete Your Profile
        </Button>
      </Box>
    );
  }

  if (!studentProfile) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography>No profile data available.</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2, bgcolor: "#4CAF50" }}
          onClick={onEdit}
        >
          Complete Your Profile
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        {/* Profile Header with Edit Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Student Profile
          </Typography>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={onEdit}
            sx={{ bgcolor: "#4CAF50", "&:hover": { bgcolor: "#388E3C" } }}
          >
            Edit Profile
          </Button>
        </Box>

        {/* Application Status */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Application Status:</Typography>
          <Chip
            label={studentProfile.applicationStatus || 'Not Applied'}
            color={
              studentProfile.applicationStatus === 'Applied' ? 'success' :
              studentProfile.applicationStatus === 'Rejected' ? 'error' :
              studentProfile.applicationStatus === 'Unapplied' ? 'default' :
              studentProfile.applicationStatus === 'In Progress' ? 'primary' :
              studentProfile.applicationStatus === 'Complete' ? 'success' :
              studentProfile.applicationStatus === 'Incomplete' ? 'warning' :
              'default'
            }
            variant={studentProfile.applicationStatus === 'Unapplied' ? 'outlined' : 'filled'}
            sx={{ fontWeight: 'bold', fontSize: '1rem', px: 2, py: 1 }}
          />
        </Box>

        {/* Wrapper Flexbox */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Left Section: Profile Info */}
          <Box
            sx={{
              flex: 1,
              textAlign: { xs: "center", md: "left" },
              boxShadow: 3,
              borderRadius: 2,
              height: "300px",
              pt: "30px",
              pl: "50px",
              pr: "250px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              {studentProfile.profilePicture ? (
                <Avatar
                  src={studentProfile.profilePicture}
                  sx={{ width: 64, height: 64 }}
                />
              ) : (
                <Avatar
                  sx={{
                    bgcolor: "#4CAF50",
                    width: 64,
                    height: 64,
                    fontSize: 24,
                  }}
                >
                  {studentProfile.firstName?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
              )}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {studentProfile.firstName} {studentProfile.lastName}
                </Typography>
                <Typography 
                  color="success.main" 
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '1px',
                    fontSize: '0.9rem',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}
                >
                  ID: {studentProfile._id?.slice(-6).toUpperCase() || "N/A"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography sx={{ color: "gray" }}>
                <strong>Email:</strong> {studentProfile.email || "Not provided"}
              </Typography>
              <Typography sx={{ color: "gray" }}>
                <strong>Phone:</strong> {studentProfile.phone || "Not provided"}
              </Typography>
              <Typography sx={{ color: "gray" }}>
                <strong>Nationality:</strong> {studentProfile.nationality || "Not provided"}
              </Typography>
              <Typography sx={{ color: "gray" }}>
                <strong>Country of Residence:</strong> {studentProfile.residenceCountry || "Not provided"}
              </Typography>
            </Box>
          </Box>

          {/* Middle Section: Profile Completion */}
          <Box
            sx={{
              flex: 1,
              textAlign: "center",
              boxShadow: 3,
              borderRadius: 2,
              height: "300px",
              pt: "50px",
              background: 'white ',
            }}
          >
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <CircularProgress
                variant="determinate"
                value={animatedPercentage}
                size={170}
                thickness={3.5}
                sx={{ 
                  color: "#4CAF50",
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4CAF50" }}>
                {animatedPercentage}%
                </Typography>
                <Typography sx={{ color: "gray", fontSize: '0.9rem' }}>
                  Profile Completed
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Section: Tasks */}
          <Box
            sx={{
              flex: 1,
              boxShadow: 3,
              borderRadius: 2,
              height: "300px",
              pt: "30px",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", textAlign: "center" }}
              >
              Tasks
            </Typography>
            <List>
              <Fade in={showTask1} timeout={800}>
                <ListItem sx={{ bgcolor: "grey.100", mb: 1, borderRadius: 1 }}>
                  <Assignment sx={{ color: "gray", mr: 2 }} />
                  <ListItemText
                    primary="Update Personal Information"
                    secondary="Recently Updated"
                  />
                </ListItem>
              </Fade>
              
              <Fade in={showTask2} timeout={800}>
                <ListItem sx={{ bgcolor: "grey.100", mb: 1, borderRadius: 1 }}>
                  <School sx={{ color: "gray", mr: 2 }} />
                  <ListItemText
                    primary="Update Study Preferences"
                    secondary="Recently Updated"
                  />
                </ListItem>
              </Fade>
              
              <Fade in={showTask3} timeout={800}>
                <ListItem sx={{ bgcolor: "grey.100", mb: 1, borderRadius: 1 }}>
                  <Description sx={{ color: "gray", mr: 2 }} />
                  <ListItemText
                    primary="Upload Required Documents"
                    secondary="Recently Updated"
                  />
                </ListItem>
              </Fade>
            </List>
          </Box>
        </Box>

        {/* Student Academic Details */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            Academic Information
          </Typography>
          <Divider />
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            mt: 2,
            '& > *': {
              flex: '1 1 calc(50% - 16px)',
              minWidth: '300px'
            }
          }}>
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor:'#edf7ed' }}>
              <SchoolIcon sx={{ color: '#4caf50' }} />
              <Box>
                <Typography variant="subtitle2" color="black" fontWeight= "bold">Education Level</Typography>
                <Typography variant="body1">{studentProfile.educationLevel || "Not provided"}</Typography>
              </Box>
            </Paper>

            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor:'#edf7ed' }}>
              <CalendarToday sx={{ color: '#4CAF50' }} />
              <Box>
                <Typography variant="subtitle2" color="black" fontWeight= "bold">Completion Year</Typography>
                <Typography variant="body1">{studentProfile.completionYear || "Not provided"}</Typography>
              </Box>
            </Paper>

            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor:'#edf7ed' }}>
              <Public sx={{ color: '#4CAF50' }} />
              <Box>
                <Typography variant="subtitle2" color="black" fontWeight= "bold">Education Country</Typography>
                <Typography variant="body1">{studentProfile.educationCountry || "Not provided"}</Typography>
              </Box>
            </Paper>

            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor:'#edf7ed' }}>
              <Score sx={{ color: '#4CAF50' }} />
              <Box>
                <Typography variant="subtitle2" color="black" fontWeight= "bold">Total Marks/CGPA</Typography>
                <Typography variant="body1">{studentProfile.totalMarksAndCgpa || "Not provided"}</Typography>
              </Box>
            </Paper>

            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor:'#edf7ed' }}>
              <Grade sx={{ color: '#4CAF50' }} />
              <Box>
                <Typography variant="subtitle2" color="black" fontWeight= "bold">Obtained Marks/CGPA</Typography>
                <Typography variant="body1">{studentProfile.obtainedMarksAndCgpa || "Not provided"}</Typography>
              </Box>
            </Paper>
            <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor:'#edf7ed' }}>
              <Public sx={{ color: '#4CAF50' }} />
              <Box>
                <Typography variant="subtitle2" color="black" fontWeight= "bold">Preferred Country</Typography>
                <Typography variant="body1">{(studentProfile.preferredCountries && studentProfile.preferredCountries[0]) || "Not provided"}</Typography>
              </Box>  
            </Paper>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default StudentProfile;
