import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PersonIcon from '@mui/icons-material/Person';

const ReviewApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmittedApplications();
  }, []);

  const fetchSubmittedApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        setError("No user logged in");
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
      const submitted = (response.data || []).filter(
        (student) => student.applicationStatus === 'Applied' || student.applicationStatus === 'Complete'
      );
      setApplications(submitted);
    } catch (err) {
      setError("Error loading applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Review Submitted Applications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
      <Paper sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Assigned Date</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((app, idx) => (
                  <TableRow key={app._id || idx}>
                  <TableCell>{app.name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                    <TableCell>
                      <Chip label={app.applicationStatus} color={app.applicationStatus === 'Applied' ? 'success' : 'primary'} />
                    </TableCell>
                    <TableCell>{app.assignedDate ? new Date(app.assignedDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="outlined" sx={{ color: '#4CAF50', fontWeight: 'bold', borderColor: '#4CAF50' }} onClick={() => setSelectedApp(app)}>
                        Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={5} align="center">
                    No submitted applications to review
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      )}

      {/* Review Modal */}
      <Dialog
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <span>Review Application</span>
          {selectedApp && (
            <Chip label={selectedApp.applicationStatus} color={selectedApp.applicationStatus === 'Applied' ? 'success' : 'primary'} size="medium" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Grid container spacing={4} alignItems="flex-start">
              {/* Left: Student Info */}
              <Grid item xs={12} md={5}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {selectedApp.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedApp.email}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>Phone: </Typography>
                    <Typography component="span">{selectedApp.phone || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>Nationality: </Typography>
                    <Typography component="span">{selectedApp.nationality || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>Education Level: </Typography>
                    <Typography component="span">{selectedApp.educationLevel || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>Preferred Countries: </Typography>
                    <Typography component="span">{Array.isArray(selectedApp.preferredCountries) ? selectedApp.preferredCountries.join(', ') : selectedApp.preferredCountries || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Grid>
              {/* Right: Documents */}
              <Grid item xs={12} md={7}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Documents</Typography>
                <Grid container spacing={2}>
                  {[
                    { key: 'transcript', label: 'Transcript', icon: <DescriptionIcon color="action" /> },
                    { key: 'passport', label: 'Passport', icon: <PersonIcon color="action" /> },
                    { key: 'englishTest', label: 'English Test', icon: <InsertDriveFileIcon color="action" /> },
                    { key: 'resume', label: 'Resume', icon: <InsertDriveFileIcon color="action" /> },
                    { key: 'referenceletter', label: 'Reference Letter', icon: <InsertDriveFileIcon color="action" /> },
                    { key: 'experienceletter', label: 'Experience Letter', icon: <InsertDriveFileIcon color="action" /> },
                  ].map(({ key, label, icon }) => {
                    const doc = selectedApp.documents?.[key];
                    const isUploaded = doc && doc.url;
                    return (
                      <Grid item xs={12} sm={6} key={key}>
                        <Paper elevation={isUploaded ? 3 : 0} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, border: isUploaded ? '1px solid #4caf50' : '1px solid #eee', borderRadius: 2, bgcolor: isUploaded ? 'rgba(76,175,80,0.05)' : '#fafafa' }}>
                          {icon}
                          <Box>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{label}</Typography>
                            {isUploaded ? (
                              <a href={
                                doc.url.startsWith('http')
                                  ? doc.url
                                  : doc.url.startsWith('/uploads/')
                                    ? `http://localhost:5001${doc.url}`
                                    : doc.url.startsWith('/files/')
                                      ? `http://localhost:5001${doc.url}`
                                      : `http://localhost:5001/files/${doc.url.replace(/^\/+/, '')}`
                              } target="_blank" rel="noopener noreferrer" style={{ color: '#388e3c', fontWeight: 500, textDecoration: 'underline' }}>{doc.url.split('/').pop()}</a>
                            ) : (
                              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>Not uploaded</Typography>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            </Grid>
          )}
          <Divider sx={{ my: 3 }} />
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={() => setSelectedApp(null)} variant="contained" sx={{ bgcolor: '#4CAF50',fontWeight: 'bold', px: 4 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewApplications;