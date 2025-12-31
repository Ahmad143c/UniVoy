import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CheckCircle as AppliedIcon,
  Pending as PendingIcon,
  GetApp as GetAppIcon,
  Cancel as RejectedIcon,
  RemoveCircleOutline as UnappliedIcon,
  Edit as UpdateIcon,
  Description,
} from "@mui/icons-material";
import axios from "axios";

const AssignedStudents = () => {
  const navigate = useNavigate();
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [selectedStudentForStatus, setSelectedStudentForStatus] = useState(null);
  const [documentStatusMenuAnchor, setDocumentStatusMenuAnchor] = useState(null);
  const [selectedStudentForDocumentStatus, setSelectedStudentForDocumentStatus] = useState(null);

  useEffect(() => {
    loadAssignedStudents();
  }, []);

  const loadAssignedStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current consultant's info from localStorage
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        setError("No user logged in");
        console.error("No current user found");
        setLoading(false);
        return;
      }

      console.log("Current User:", currentUser);

      // Get consultant's profile to get their ID
      const consultantProfile = JSON.parse(
        localStorage.getItem(`profile_${currentUser.email}`)
      ) || {};

      console.log("Consultant Profile:", consultantProfile);

      // Get consultant ID from currentUser (this is the correct field)
      const consultantId = currentUser.id;
      
      if (!consultantId) {
        setError("Consultant ID not found");
        setLoading(false);
        return;
      }

      // Fetch assigned students from API
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5001/api/consultants/${consultantId}/assigned-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data);
      setAssignedStudents(response.data);
      setError(null);
    } catch (err) {
      console.error("Error loading assigned students:", err);
      setError(err.response?.data?.message || "Error loading assigned students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setViewDetailsOpen(true);
  };

  const handleDownloadDocument = async (studentId, documentType, documentName, student) => {
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

      // Prompt status update after download
      setTimeout(() => {
        handleStatusMenuOpen({ currentTarget: document.body }, student);
      }, 300);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Error downloading document. Please try again.");
    }
  };

  const handleStatusMenuOpen = (event, student) => {
    setStatusMenuAnchor(event.currentTarget);
    setSelectedStudentForStatus(student);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
    setSelectedStudentForStatus(null);
  };

  const handleDocumentStatusMenuOpen = (event, student) => {
    setDocumentStatusMenuAnchor(event.currentTarget);
    setSelectedStudentForDocumentStatus(student);
  };

  const handleDocumentStatusMenuClose = () => {
    setDocumentStatusMenuAnchor(null);
    setSelectedStudentForDocumentStatus(null);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const consultantId = currentUser.id;
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5001/api/consultants/${consultantId}/students/${selectedStudentForStatus._id}/status`,
        { applicationStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setAssignedStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === selectedStudentForStatus._id
            ? { ...student, applicationStatus: newStatus }
            : student
        )
      );

      handleStatusMenuClose();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    }
  };

  const handleDocumentStatusUpdate = async (newStatus) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const consultantId = currentUser.id;
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5001/api/students/${selectedStudentForDocumentStatus._id}/document-status`,
        { documentStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setAssignedStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === selectedStudentForDocumentStatus._id
            ? { ...student, documentStatus: newStatus }
            : student
        )
      );

      handleDocumentStatusMenuClose();
    } catch (error) {
      console.error("Error updating document status:", error);
      alert("Error updating document status. Please try again.");
    }
  };

  const getStatusChip = (status) => {
    const statusColors = {
      "Not Applied": "default",
      "Applied": "success",
      "In Progress": "primary",
      "Complete": "success",
      "Incomplete": "warning",
      "Pending": "default",
    };

    return (
      <Chip
        label={status}
        color={statusColors[status] || "default"}
        size="small"
        icon={status === "Applied" ? <AppliedIcon /> : <PendingIcon />}
      />
    );
  };

  const getDocumentStatusChip = (status) => {
    const statusColors = {
      "Not Reviewed": "default",
      "Under Review": "warning",
      "Complete": "success",
      "Incomplete": "error",
      "Approved": "success",
      "Rejected": "error",
    };

    return (
      <Chip
        label={status || "Not Reviewed"}
        color={statusColors[status] || "default"}
        size="small"
        icon={status === "Complete" || status === "Approved" ? <AppliedIcon /> : <PendingIcon />}
      />
    );
  };

  const getDocumentStatus = (document) => {
    return document && document.url ? "Uploaded" : "Not Uploaded";
  };

  const getDocumentChip = (document, documentType) => {
    const isUploaded = document && document.url;
    return (
      <Chip
        label={getDocumentStatus(document)}
        color={isUploaded ? "success" : "default"}
        size="small"
        variant={isUploaded ? "filled" : "outlined"}
      />
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        My Assigned Students
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
        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Student Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Application Status</strong></TableCell>
                <TableCell><strong>Document Status</strong></TableCell>
                <TableCell><strong>Assigned Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedStudents.length > 0 ? (
                assignedStudents.map((student, index) => (
                  <TableRow key={student._id || index}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {getStatusChip(student.applicationStatus || "Not Applied")}
                    </TableCell>
                    <TableCell>
                      {getDocumentStatusChip(student.documentStatus || "Not Reviewed")}
                    </TableCell>
                    <TableCell>
                      {student.assignedDate ? new Date(student.assignedDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          sx={{ color: '#4CAF50', fontWeight: 'bold', borderColor: '#4CAF50' }}
                          size="small"
                          onClick={() => handleViewDetails(student)}
                        >
                          <ViewIcon sx={{ mr: 0.5 }} />
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => navigate(`/consultant-dashboard/student/${student._id}`)}
                        >
                          Profile
                        </Button>
                        <Button
                          variant="contained"
                          color={
                            student.applicationStatus === "Applied"
                              ? "success"
                              : student.applicationStatus === "Rejected"
                              ? "error"
                              : student.applicationStatus === "Unapplied"
                              ? "inherit"
                              : "primary"
                          }
                          size="small"
                          startIcon={
                            student.applicationStatus === "Applied" ? <AppliedIcon /> :
                            student.applicationStatus === "Rejected" ? <RejectedIcon /> :
                            student.applicationStatus === "Unapplied" ? <UnappliedIcon /> :
                            <UpdateIcon />
                          }
                          onClick={(e) => handleStatusMenuOpen(e, student)}
                        >
                          {student.applicationStatus === "Applied"
                            ? "Applied"
                            : student.applicationStatus === "Rejected"
                            ? "Rejected"
                            : student.applicationStatus === "Unapplied"
                            ? "Unapplied"
                            : "Update Status"}
                        </Button>
                        <Button
                          variant="outlined"
                          color="info"
                          size="small"
                          startIcon={<Description />}
                          onClick={(e) => handleDocumentStatusMenuOpen(e, student)}
                        >
                          Docs Status
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No students assigned yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Student Details Dialog */}
      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Student Details</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedStudent && (
                <>
                  <Chip
                    label={selectedStudent.applicationStatus || "Not Applied"}
                    color={selectedStudent.applicationStatus === "Applied" ? "success" : "default"}
                    icon={selectedStudent.applicationStatus === "Applied" ? <AppliedIcon /> : <PendingIcon />}
                  />
                  <Chip
                    label={selectedStudent.documentStatus || "Not Reviewed"}
                    color={
                      selectedStudent.documentStatus === "Complete" || selectedStudent.documentStatus === "Approved" ? "success" :
                      selectedStudent.documentStatus === "Under Review" ? "warning" :
                      selectedStudent.documentStatus === "Incomplete" || selectedStudent.documentStatus === "Rejected" ? "error" :
                      "default"
                    }
                    icon={selectedStudent.documentStatus === "Complete" || selectedStudent.documentStatus === "Approved" ? <AppliedIcon /> : <PendingIcon />}
                  />
                </>
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: '#4CAF50'}}>
                    {selectedStudent.name}
                  </Typography>
                  <Typography color="textSecondary">
                    {selectedStudent.email}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Phone:</strong> {selectedStudent.phone || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Nationality:</strong> {selectedStudent.nationality || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography>
                    <strong>Interested Countries:</strong>{" "}
                    {Array.isArray(selectedStudent.preferredCountries)
                      ? selectedStudent.preferredCountries.join(", ")
                      : selectedStudent.preferredCountries || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Documents
                  </Typography>
                  <List dense>
                    {[
                      { key: "transcript", label: "Academic Transcript" },
                      { key: "passport", label: "Passport" },
                      { key: "englishTest", label: "English Test Certificate" },
                      { key: "resume", label: "Resume" },
                      { key: "referenceletter", label: "Reference Letter" },
                      { key: "experienceletter", label: "Experience Letter" },
                    ].map(({ key, label }) => {
                      const document = selectedStudent.documents?.[key];
                      const isUploaded = document && document.url;
                      
                      return (
                        <ListItem key={key} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                          <ListItemIcon>
                            <GetAppIcon color={isUploaded ? "success" : "disabled"} />
                          </ListItemIcon>
                          <ListItemText
                            primary={label}
                            secondary={isUploaded ? document.name : "Not uploaded"}
                          />
                          {isUploaded && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Document">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{ color: '#4CAF50', fontWeight: 'bold', borderColor: '#4CAF50' }}
                                  href={
                                    document.url.startsWith('http')
                                      ? document.url
                                      : document.url.startsWith('/uploads/')
                                        ? `http://localhost:5001${document.url}`
                                        : document.url.startsWith('/files/')
                                          ? `http://localhost:5001${document.url}`
                                          : `http://localhost:5001/files/${document.url.replace(/^\/+/, '')}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </Button>
                              </Tooltip>
                              <Tooltip title="Download Document">
                                <IconButton
                                  sx={{ color: '#4CAF50'}}
                                  onClick={() => handleDownloadDocument(selectedStudent._id, key, document.name, selectedStudent)}
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
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button sx={{ color: '#4CAF50'}} onClick={() => setViewDetailsOpen(false)}>Close</Button>
          {selectedStudent && (
            <Button
              variant="contained"
              color={selectedStudent.applicationStatus === "Applied" ? "success" : "primary"}
              onClick={(e) => {
                setViewDetailsOpen(false);
                handleStatusMenuOpen(e, selectedStudent);
              }}
            >
              {selectedStudent.applicationStatus === "Applied" ? "Applied" : "Mark Applied"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Status Update Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            boxShadow: 3,
            borderRadius: 3,
          }
        }}
        MenuListProps={{
          sx: {
            p: 0,
          }
        }}
      >
        <MenuItem onClick={() => handleStatusUpdate("Applied")}
          sx={{ justifyContent: 'center', p: 0, mb: 1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(76,175,80,0.08)' } }}>
          <Chip label="Applied" color="success" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleStatusUpdate("Rejected")}
          sx={{ justifyContent: 'center', p: 0, mb: 1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(244,67,54,0.08)' } }}>
          <Chip label="Rejected" color="error" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleStatusUpdate("In Progress")}
          sx={{ justifyContent: 'center', p: 0, mb: 1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(33,150,243,0.08)' } }}>
          <Chip label="In Progress" color="primary" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleStatusUpdate("Complete")}
          sx={{ justifyContent: 'center', p: 0, mb: 1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(76,175,80,0.08)' } }}>
          <Chip label="Complete" color="success" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleStatusUpdate("Incomplete")}
          sx={{ justifyContent: 'center', p: 0, mb: 0, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(255,152,0,0.08)' } }}>
          <Chip label="Incomplete" color="warning" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
      </Menu>

      {/* Document Status Update Menu */}
      <Menu
        anchorEl={documentStatusMenuAnchor}
        open={Boolean(documentStatusMenuAnchor)}
        onClose={handleDocumentStatusMenuClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            boxShadow: 3,
            borderRadius: 3,
          }
        }}
        MenuListProps={{
          sx: {
            p: 0,
          }
        }}
      >
        <MenuItem onClick={() => handleDocumentStatusUpdate("Not Reviewed")}
          sx={{ justifyContent: 'center', p: 0, mb: 1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(158,158,158,0.08)' } }}>
          <Chip label="Not Reviewed" color="default" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleDocumentStatusUpdate("Under Review")}
          sx={{ justifyContent: 'center', p: 0, mb: 1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(255,152,0,0.08)' } }}>
          <Chip label="Under Review" color="warning" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleDocumentStatusUpdate("Complete")}
          sx={{ justifyContent: 'center', p: 0, mb: 1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(76,175,80,0.08)' } }}>
          <Chip label="Complete" color="success" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleDocumentStatusUpdate("Incomplete")}
          sx={{ justifyContent: 'center', p: 0, mb: 1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(244,67,54,0.08)' } }}>
          <Chip label="Incomplete" color="error" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleDocumentStatusUpdate("Approved")}
          sx={{ justifyContent: 'center', p: 0, mb: 1, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(76,175,80,0.08)' } }}>
          <Chip label="Approved" color="success" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => handleDocumentStatusUpdate("Rejected")}
          sx={{ justifyContent: 'center', p: 0, mb: 0, borderRadius: 2, transition: 'background 0.2s', '&:hover': { background: 'rgba(244,67,54,0.08)' } }}>
          <Chip label="Rejected" color="error" size="medium" sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '1.05rem', px: 2.5, py: 1.2, borderRadius: 2, boxShadow: 1 }} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AssignedStudents;
