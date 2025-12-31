import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Stack,
  Chip,
  Avatar,
  Card,
  CardMedia,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  School as SchoolIcon,
  CalendarToday,
  Public,
  Score,
  Grade,
  Person,
  Email,
  Phone,
  LocationOn,
  Assignment,
  Work,
  Language,
  AttachMoney,
  Event,
  CheckCircle,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";
import DescriptionIcon from '@mui/icons-material/Description';
import defaultImage from "../../assets/images/default.png";

const ConsultantStudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  useEffect(() => {
    if (student) {
      fetchApplications();
    }
  }, [student]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Fetch student details - verify they are assigned to this consultant
      const studentResponse = await axios.get(`http://localhost:5001/api/consultants/${currentUser.id}/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Calculate profile completion percentage
      const completionPercentage = calculateProfileCompletion(studentResponse.data);
      
      // Add completion percentage to student data
      const studentWithCompletion = {
        ...studentResponse.data,
        profileCompletion: completionPercentage
      };

      setStudent(studentWithCompletion);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err.response?.data?.message || 'Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Extract user ID from student data
      let userId;
      if (student?.user) {
        if (typeof student.user === 'string') {
          userId = student.user;
        } else if (student.user._id) {
          userId = student.user._id;
        }
      }
      
      if (!userId) {
        userId = studentId;
      }
      
      // Get applications for the specific student
      const response = await axios.get(`http://localhost:5001/api/course-applications/student/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setApplications(response.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    }
  };

  const handleDownloadDocument = async (documentType, documentName) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const consultantId = currentUser.id;
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5001/api/consultants/${consultantId}/students/${studentId}/documents/${documentType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentName || `${documentType}_document`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Error downloading document. Please try again.");
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return defaultImage;
    
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    
    if (imageName.startsWith('/uploads/') || imageName.startsWith('/assets/')) {
      return `http://localhost:5001${imageName}`;
    }
    
    try {
      return require(`../../assets/images/${imageName}`);
    } catch (err) {
      console.warn(`Image not found: ${imageName}, using default`);
      return defaultImage;
    }
  };

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
      if (profile.documents && profile.documents[field] && profile.documents[field].url) completedFields++;
    });

    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    return completionPercentage;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box p={3}>
        <Alert severity="warning">Student not found</Alert>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper for documents
  const documentTypes = [
    { name: 'transcript', label: 'Academic Transcript' },
    { name: 'englishTest', label: 'English Test Certificate' },
    { name: 'experienceletter', label: 'Experience Letter' },
    { name: 'resume', label: 'Resume' },
    { name: 'passport', label: 'Passport' },
    { name: 'referenceletter', label: 'Reference Letter' }
  ];

  // Compute preferred countries from applications
  const appliedCountries = Array.from(
    new Set(applications.map(app => app.universityData.location))
  );

  // Get preferred countries from student profile or fallback to applied countries
  const preferredCountries = student.preferredCountries || appliedCountries;

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/consultant-dashboard')}
        sx={{ mb: 3, color: '#22502C' }}
      >
        Back to Dashboard
      </Button>

      <Grid container spacing={3}>
        {/* Left Column - Profile Overview */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              {student.profilePicture ? (
                <Avatar
                  src={student.profilePicture}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#4CAF50',
                    fontSize: '3rem',
                    mb: 2
                  }}
                >
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </Avatar>
              )}
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4CAF50" }}>
                {student.firstName} {student.lastName}
              </Typography>
              <Chip 
                label={student.status || 'Active'} 
                color={getStatusColor(student.status)}
                sx={{ 
                  mt: 1,
                  fontWeight: 'bold',
                  '& .MuiChip-label': { px: 2 }
                }}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ color: '#4CAF50' }} />
                <Typography>univoy@info.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: '#4CAF50' }} />
                <Typography>+92 331 9565259</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#4CAF50' }} />
                <Typography>Residence: {student.residenceCountry || "Not provided"}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Public sx={{ color: '#4CAF50' }} />
                <Typography>Nationality: {student.nationality || "Not provided"}</Typography>
              </Box>
            </Stack>
            {/* Preferred Countries */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Preferred Countries</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {preferredCountries.length > 0 ? (
                preferredCountries.map((country, idx) => (
                  <Chip 
                    key={idx} 
                    icon={<Public fontSize="small" />} 
                    label={country} 
                    size="small" 
                    variant="outlined"
                    sx={{
                      bgcolor: "#4CAF50",
                      color: "#FFFFFF",
                      fontWeight: 500,
                    }}
                  />
                ))
              ) : (
                <Typography color="text.secondary">No preferred countries selected.</Typography>
              )}
            </Box>
            {/* Documents */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Documents</Typography>
            <List dense>
              {documentTypes.map(doc => {
                const docObj = student.documents?.[doc.name];
                const isUploaded = docObj && docObj.url;
                
                return (
                  <ListItem key={doc.name} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <DescriptionIcon color={isUploaded ? "success" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.label}
                      secondary={isUploaded ? docObj.name : "Not uploaded"}
                    />
                    {isUploaded && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Document">
                          <Button
                            size="small"
                            variant="outlined"
                            href={
                              docObj.url.startsWith('http')
                                ? docObj.url
                                : docObj.url.startsWith('/uploads/')
                                  ? `http://localhost:5001${docObj.url}`
                                  : docObj.url.startsWith('/files/')
                                    ? `http://localhost:5001${docObj.url}`
                                    : `http://localhost:5001/files/${docObj.url.replace(/^\/+/, '')}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: '#4CAF50', fontWeight: 'bold', borderColor: '#4CAF50' }}   
                          >
                            View
                          </Button>
                        </Tooltip>
                        <Tooltip title="Download Document">
                          <IconButton
                            sx={{ color: '#4CAF50'}}
                            onClick={() => handleDownloadDocument(doc.name, docObj.name)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Right Column - Detailed Information */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Academic Information */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#22502C", fontWeight: "bold" }}>
                Academic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <SchoolIcon sx={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle2" color="text.secondary">Education Level</Typography>
                  </Box>
                  <Typography variant="body1">{student.educationLevel || student.currentEducationLevel || "Not provided"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday sx={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle2" color="text.secondary">Completion Year</Typography>
                  </Box>
                  <Typography variant="body1">{student.completionYear || "Not provided"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Public sx={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle2" color="text.secondary">Education Country</Typography>
                  </Box>
                  <Typography variant="body1">{student.educationCountry || student.desiredCountry || "Not provided"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Score sx={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle2" color="text.secondary">Marks/CGPA</Typography>
                  </Box>
                  <Typography variant="body1">
                    {student.obtainedMarksAndCgpa && student.totalMarksAndCgpa ?
                      `${student.obtainedMarksAndCgpa} / ${student.totalMarksAndCgpa}` :
                      "Not provided"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Application Status */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex',gap:1,mb: 2, }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#22502C", fontWeight: "bold" }}>
                Application Status:
              </Typography>
              <Box sx={{ mb: 2,mr: 14  }}>
                <Chip
                  label={student.applicationStatus || 'Not Applied'}
                  color={
                    student.applicationStatus === 'Applied' ? 'success' :
                    student.applicationStatus === 'Rejected' ? 'error' :
                    student.applicationStatus === 'Unapplied' ? 'default' :
                    student.applicationStatus === 'In Progress' ? 'primary' :
                    student.applicationStatus === 'Complete' ? 'success' :
                    student.applicationStatus === 'Incomplete' ? 'warning' :
                    'default'
                  }
                  variant={student.applicationStatus === 'Unapplied' ? 'outlined' : 'filled'}
                  sx={{ fontWeight: 'bold', fontSize: '1rem', px: 2, py: 1 }}
                />
              </Box>
              
              {/* Document Status */}
              <Box sx={{ display: 'flex',gap:1,mb: 2,pl:22 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#22502C", fontWeight: "bold"}}>Documents Status:</Typography>
                <Chip
                  label={student.documentStatus || 'Not Reviewed'}
                  color={
                    student.documentStatus === 'Complete' || student.documentStatus === 'Approved' ? 'success' :
                    student.documentStatus === 'Under Review' ? 'warning' :
                    student.documentStatus === 'Incomplete' || student.documentStatus === 'Rejected' ? 'error' :
                    'default'
                  }
                  variant="filled"
                  sx={{ fontWeight: 'bold', fontSize: '1rem', px: 2, py: 1 }}
                />
              </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Work sx={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle2" color="text.secondary">Profile Completion</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">
                      {student.profileCompletion || 0}%
                    </Typography>
                    <Box sx={{ flex: 1, height: 8, bgcolor: '#e0e0e0', borderRadius: 4 }}>
                      <Box
                        sx={{
                          height: '100%',
                          width: `${student.profileCompletion || 0}%`,
                          bgcolor: '#4CAF50',
                          borderRadius: 4
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday sx={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle2" color="text.secondary">Assigned Date</Typography>
                  </Box>
                  <Typography variant="body1">
                    {student.consultantAssignedAt ? new Date(student.consultantAssignedAt).toLocaleDateString() : "Not available"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Student Metadata */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#22502C", fontWeight: "bold" }}>
                Student Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person sx={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle2" color="text.secondary">Student ID</Typography>
                  </Box>
                  <Typography variant="body1">
                    #{student._id?.slice(-6).toUpperCase() || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday sx={{ color: '#4CAF50' }} />
                    <Typography variant="subtitle2" color="text.secondary">Profile Created</Typography>
                  </Box>
                  <Typography variant="body1">
                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "Not available"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Applied Universities */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#22502C", fontWeight: "bold" }}>
                Applied Universities
              </Typography>
              {applications.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    justifyContent: {
                      xs: "flex-start",
                      md: "space-between",
                    },
                  }}
                >
                  {[...applications]
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                    .map((application, index) => (
                      <Card
                        key={index}
                        sx={{
                          width: { xs: "100%", sm: "48%", md: "32%" },
                          p: 2,
                          boxShadow: 3,
                          borderRadius: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 2,
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={getImageUrl(application.universityData.image)}
                            alt={application.universityData.name}
                            sx={{
                              width: { xs: "100%", sm: 120 },
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 2,
                            }}
                          />

                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {application.universityData.name}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                              {application.universityData.title}
                            </Typography>

                            <Divider sx={{ my: 1 }} />

                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                              sx={{ mt: 2 }}
                            >
                              <Chip
                                icon={<LocationOn fontSize="small" />}
                                label={application.universityData.location}
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                icon={<AttachMoney fontSize="small" />}
                                label={`Tuition Fee: ${application.universityData.tuition_fee}`}
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                icon={<Event fontSize="small" />}
                                label={`Intake: ${application.universityData.intake}`}
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                icon={<CheckCircle fontSize="small" />}
                                label={`Status: ${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`}
                                color={
                                  application.status === 'approved' ? 'success' :
                                  application.status === 'rejected' ? 'error' :
                                  'warning'
                                }
                                size="small"
                              />
                            </Stack>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No applications found.</Typography>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsultantStudentProfile; 