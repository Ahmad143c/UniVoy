import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Menu,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import axios from "axios";

const AssignStudentToConsultant = () => {
  const [students, setStudents] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [selectedStudentForStatus, setSelectedStudentForStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchConsultants();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await axios.get("http://localhost:5001/api/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched students data:", response.data);
      setStudents(response.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(err.response?.data?.message || "Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultants = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await axios.get("http://localhost:5001/api/consultants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConsultants(response.data || []);
    } catch (err) {
      console.error("Error fetching consultants:", err);
      setError(err.response?.data?.message || "Error fetching consultants");
    }
  };

  const handleAssignment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      // Find the selected student and consultant
      const student = students.find(s => s._id === selectedStudent);
      const consultant = consultants.find(c => c._id === selectedConsultant);

      if (!student || !consultant) {
        setError("Selected student or consultant not found");
        return;
      }

      // Update student's assigned consultant
      await axios.put(
        `http://localhost:5001/api/students/${selectedStudent}/assign-consultant`,
        { consultantId: selectedConsultant },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh students list
      await fetchStudents();
      
      // Reset form
      setSelectedStudent("");
      setSelectedConsultant("");
      
      alert("Student assigned successfully!");
    } catch (err) {
      console.error("Error assigning student:", err);
      setError(err.response?.data?.message || "Error assigning student to consultant");
    } finally {
      setLoading(false);
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

  const handleDocumentStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      await axios.put(
        `http://localhost:5001/api/students/${selectedStudentForStatus._id}/document-status`,
        { documentStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh students list to get updated data from server
      await fetchStudents();

      handleStatusMenuClose();
      alert("Document status updated successfully!");
    } catch (error) {
      console.error("Error updating document status:", error);
      setError(error.response?.data?.message || "Error updating document status");
    }
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
        icon={status === "Complete" || status === "Approved" ? <CheckCircleIcon /> : <PendingIcon />}
      />
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Assign Student to Consultant
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel>Select Student</InputLabel>
        <Select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          disabled={loading}
        >
          {students.map((student) => (
            <MenuItem key={student._id} value={student._id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography>
                  {student.firstName} {student.lastName} ({student.email})
                </Typography>
                {student.documentStatus && (
                  <Chip
                    label={student.documentStatus}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ my: 2 }}>
        <InputLabel>Select Consultant</InputLabel>
        <Select
          value={selectedConsultant}
          onChange={(e) => setSelectedConsultant(e.target.value)}
          disabled={loading}
        >
          {consultants.map((consultant) => (
            <MenuItem key={consultant._id} value={consultant._id}>
              {consultant.profile?.firstName} {consultant.profile?.lastName} ({consultant.email})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleAssignment}
          disabled={!selectedStudent || !selectedConsultant || loading}
        >
          Assign
        </Button>

        {selectedStudent && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SchoolIcon />}
            onClick={(e) => {
              const student = students.find(s => s._id === selectedStudent);
              if (student) {
                handleStatusMenuOpen(e, student);
              }
            }}
            disabled={loading}
          >
            Edu & Docs Status
          </Button>
        )}
      </Box>

      {/* Document Status Update Menu */}
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
    </Paper>
  );
};

export default AssignStudentToConsultant;
