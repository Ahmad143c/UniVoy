import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  CircularProgress,
  Card,
  CardMedia,
  Divider,
  Stack,
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import axios from "axios";
import EditIcon from '@mui/icons-material/Edit';
import { LocationOn, AttachMoney, Event, CheckCircle } from '@mui/icons-material';

const statusOptions = ["Submitted", "In Review", "Accepted", "Rejected"];

const applicationStatusOptions = [
  'pending', 'submitted', 'in review', 'approved', 'rejected', 'accepted', 'complete', 'incomplete'
];

const TrackSubmissions = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [submissions, setSubmissions] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [studentFiles, setStudentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedUnis, setAppliedUnis] = useState({});
  const [appliedUnisDialogOpen, setAppliedUnisDialogOpen] = useState(false);
  const [appliedUnisStudent, setAppliedUnisStudent] = useState(null);
  const [appliedUnisList, setAppliedUnisList] = useState([]);
  const [appliedUnisLoading, setAppliedUnisLoading] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  useEffect(() => {
    const fetchAssignedStudents = async () => {
      try {
        setLoading(true);
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
          setSubmissions([]);
          setLoading(false);
          return;
        }
        const consultantId = currentUser.id;
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5001/api/consultants/${consultantId}/assigned-students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Only show students with applicationStatus 'Applied' or 'Complete'
        const applied = (response.data || []).filter(
          (student) => student.applicationStatus === 'Applied' || student.applicationStatus === 'Complete'
        ).map(student => ({
          ...student,
          university: student.preferredCountries || 'N/A',
          date: student.assignedDate,
          status: student.applicationStatus,
        }));
        setSubmissions(applied);
      } catch (err) {
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedStudents();
  }, []);

  const handleStatusChange = (email, newStatus) => {
    const updated = submissions.map((entry) =>
      entry.email === email ? { ...entry, status: newStatus } : entry
    );
    setSubmissions(updated);
    localStorage.setItem(`consultantStatus_${email}`, newStatus);
  };

  const filtered = submissions.filter((entry) =>
    statusFilter === "All" ? true : entry.status === statusFilter
  );

  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
  });

  const fetchStudentFiles = (student) => {
    setStudentFiles([]);
  };

  const handleOpenUpload = (student) => {
    setSelectedStudent(student);
    setSelectedFiles([]);
    fetchStudentFiles(student);
    setUploadOpen(true);
  };

  const handleCloseUpload = () => {
    setUploadOpen(false);
    setSelectedStudent(null);
    setSelectedFiles([]);
    setStudentFiles([]);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!selectedStudent || selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const studentId = selectedStudent._id;
      for (const file of selectedFiles) {
        // 1. Upload file to /api/upload
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await axios.post(
          'http://localhost:5001/files/upload',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
          }
        );
        const fileUrl = uploadRes.data.url;
        // 2. Save reference in student.universityDocuments
        await axios.post(
          `http://localhost:5001/api/students/${studentId}/university-documents`,
          { name: file.name, url: fileUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // 3. Refresh files list
      await fetchStudentFiles(selectedStudent);
      setSelectedFiles([]);
      setUploadOpen(false);
    } catch (err) {
      alert('Error uploading files.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Fetch applied universities for a student
  const fetchAppliedUniversities = async (student) => {
    const userId = student.user?._id || student.user;
    if (!userId) return;
    setAppliedUnis(prev => ({ ...prev, [student._id]: 'loading' }));
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5001/api/course-applications/student/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const universities = (response.data || []).map(app => app.universityData?.name).filter(Boolean);
      setAppliedUnis(prev => ({ ...prev, [student._id]: universities }));
    } catch (err) {
      setAppliedUnis(prev => ({ ...prev, [student._id]: [] }));
    }
  };

  // Fetch applied universities for all students after loading submissions
  useEffect(() => {
    if (!loading && submissions.length > 0) {
      submissions.forEach(student => {
        if (student._id) fetchAppliedUniversities(student);
      });
    }
    // eslint-disable-next-line
  }, [loading]);

  // Fetch applications for dialog
  const handleOpenAppliedUnisDialog = async (student) => {
    console.log('Opening dialog for student:', student);
    console.log('Student user field:', student.user);
    console.log('Student user._id:', student.user?._id);
    setAppliedUnisStudent(student);
    setAppliedUnisDialogOpen(true);
    setAppliedUnisLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = student.user?._id || student.user;
      console.log('Using userId for API call:', userId);
      if (!userId) {
        console.warn('No userId found for student. Backend should include user field.');
        setAppliedUnisList([]);
        setAppliedUnisLoading(false);
        return;
      }
      const response = await axios.get(
        `http://localhost:5001/api/course-applications/student/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('API response:', response.data);
      setAppliedUnisList(response.data || []);
    } catch (err) {
      console.error('API error:', err);
      setAppliedUnisList([]);
    } finally {
      setAppliedUnisLoading(false);
    }
  };

  const handleCloseAppliedUnisDialog = () => {
    setAppliedUnisDialogOpen(false);
    setAppliedUnisStudent(null);
    setAppliedUnisList([]);
  };

  // Update status for a university application
  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5001/api/course-applications/${appId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppliedUnisList(prev => prev.map(app =>
        app._id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Helper for image URL (reuse from ConsultantStudentProfile)
  const getImageUrl = (imageName) => {
    const defaultImage = 'https://via.placeholder.com/150'; // Placeholder image
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
      return defaultImage;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        📍 Track Submitted Applications
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Nationality</strong></TableCell>
                <TableCell><strong>Education Level</strong></TableCell>
                <TableCell><strong>Completion Year</strong></TableCell>
                <TableCell><strong>Preferred Details</strong></TableCell>
                <TableCell><strong>Applied Universities</strong></TableCell>
                <TableCell><strong>Submission Date</strong></TableCell>
                <TableCell><strong>Upload</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.phone || 'N/A'}</TableCell>
                  <TableCell>{entry.nationality || 'N/A'}</TableCell>
                  <TableCell>{entry.educationLevel || 'N/A'}</TableCell>
                  <TableCell>{entry.completionYear || entry.completion_year || (entry.profile && entry.profile.completionYear) || 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                      {Array.isArray(entry.preferredCountries)
                        ? entry.preferredCountries.map((country, i) => (
                            <Chip key={i}  label={country} sx={{ bgcolor: '#4CAF50', color: '#ffffff'}} size="small" />
                          ))
                        : entry.preferredCountries
                        ? <Chip label={entry.preferredCountries} color="primary" size="small" />
                        : <Chip label="N/A" size="small" />}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Array.isArray(entry.preferredUniversities)
                        ? entry.preferredUniversities.map((uni, i) => (
                            <Chip key={i} label={uni} color="success" size="small" />
                          ))
                        : entry.preferredUniversities
                        ? <Chip label={entry.preferredUniversities} color="success" size="small" />
                        : <Chip label="N/A" size="small" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ color: '#4CAF50', fontWeight: 'bold', borderColor: '#4CAF50' }}
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenAppliedUnisDialog(entry)}
                    >
                      View/Update
                    </Button>
                  </TableCell>
                  <TableCell>{entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton sx={{ color: '#4CAF50' }} onClick={() => handleOpenUpload(entry)}>
                      <CloudUploadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={uploadOpen} onClose={handleCloseUpload} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0 }}>
          <CloudUploadIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
          <Typography variant="h6" fontWeight="bold" color="#25502D">
            Upload University Documents
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {/* Student Info */}
          <Paper elevation={2} sx={{ p: 2, mb: 2, borderLeft: '5px solid #4CAF50', borderRadius: 2, bgcolor: '#f8f9fa' }}>
            <Typography variant="subtitle1" fontWeight="bold" color="#25502D">
              Student: <span style={{ color: '#4CAF50' }}>{selectedStudent?.name}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedStudent?.email}
            </Typography>
          </Paper>

          {/* Drag-and-drop area */}
          <Box
            sx={{
              border: '2px dashed #4CAF50',
              borderRadius: 2,
              p: 3,
              mb: 2,
              textAlign: 'center',
              bgcolor: '#f5fff7',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              '&:hover': { borderColor: '#388e3c', bgcolor: '#e8f5e9' },
            }}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input
              id="file-upload-input"
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <CloudUploadIcon sx={{ color: '#4CAF50', fontSize: 40, mb: 1 }} />
            <Typography variant="body1" color="#25502D" fontWeight="bold">
              Drag & drop files here or <span style={{ color: '#4CAF50', textDecoration: 'underline', cursor: 'pointer' }}>browse</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (PDF, JPG, PNG, etc. | Max 10MB each)
            </Typography>
          </Box>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedFiles.map((file, idx) => (
                <Chip
                  key={idx}
                  icon={<InsertDriveFileIcon sx={{ color: '#388e3c' }} />}
                  label={`${file.name} (${Math.round(file.size / 1024)} KB)`}
                  onDelete={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                  sx={{ bgcolor: '#e8f5e9', color: '#25502D', fontWeight: 'bold', borderRadius: 1 }}
                />
              ))}
            </Box>
          )}

          {/* Already Uploaded Files */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: '#25502D', fontWeight: 'bold' }}>Already Uploaded Files</Typography>
          {studentFiles.length === 0 ? (
            <Typography color="text.secondary">No files uploaded yet.</Typography>
          ) : (
            <Paper elevation={1} sx={{ p: 1.5, borderLeft: '4px solid #4CAF50', borderRadius: 2, bgcolor: '#f8f9fa', mb: 1 }}>
              <List dense>
                {studentFiles.map((file, idx) => (
                  <ListItem key={idx} secondaryAction={
                    <Button href={
                      file.url.startsWith('http')
                        ? file.url
                        : file.url.startsWith('/uploads/')
                          ? `http://localhost:5001${file.url}`
                          : file.url.startsWith('/files/')
                            ? `http://localhost:5001${file.url}`
                            : `http://localhost:5001/files/${file.url.replace(/^\/+/, '')}`
                    } target="_blank" rel="noopener noreferrer" size="small" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>View</Button>
                  }>
                    <InsertDriveFileIcon sx={{ mr: 1, color: '#388e3c' }} />
                    <ListItemText primary={file.name} secondary={`${Math.round(file.size / 1024)} KB`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseUpload} color="secondary" variant="outlined" sx={{ borderRadius: 2, fontWeight: 'bold', mr: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            color="success"
            variant="contained"
            disabled={uploading || selectedFiles.length === 0}
            startIcon={<CloudUploadIcon />}
            sx={{ borderRadius: 2, fontWeight: 'bold', bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388e3c' } }}
          >
            {uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Applied Universities Dialog */}
      <Dialog open={appliedUnisDialogOpen} onClose={handleCloseAppliedUnisDialog} maxWidth="md" fullWidth>
        <DialogTitle>Applied Universities for {appliedUnisStudent?.name}</DialogTitle>
        <DialogContent>
          {appliedUnisLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
              <CircularProgress />
            </Box>
          ) : appliedUnisList.length === 0 ? (
            <Typography color="text.secondary">No applications found.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'flex-start', md: 'space-between' } }}>
              {[...appliedUnisList]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((application, index) => (
                  <Card
                    key={application._id}
                    sx={{ width: { xs: '100%', sm: '48%', md: '32%' }, p: 2, boxShadow: 3, borderRadius: 3 }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                      <CardMedia
                        component="img"
                        image={getImageUrl(application.universityData.image)}
                        alt={application.universityData.name}
                        sx={{ width: { xs: '100%', sm: 120 }, height: 100, objectFit: 'cover', borderRadius: 2 }}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {application.universityData.name}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          {application.universityData.title}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
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
                          <FormControl size="small" sx={{ minWidth: 120, ml: 2 }}>
                            <Select
                              value={application.status}
                              onChange={e => handleUpdateApplicationStatus(application._id, e.target.value)}
                              disabled={updatingAppId === application._id}
                            >
                              {applicationStatusOptions.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                      </Box>
                    </Box>
                  </Card>
                ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAppliedUnisDialog} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrackSubmissions;
