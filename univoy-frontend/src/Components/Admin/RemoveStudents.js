import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import api from "../../Services/api";

const RemoveStudents = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      setStudents(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setOpenConfirm(true);
  };

  const handleCloseModal = () => {
    setOpenConfirm(false);
    setSelectedStudent(null);
  };

  const handleConfirmRemove = async () => {
    try {
      await api.delete(`/students/${selectedStudent._id}`);
      
      // Update the students list
      setStudents(students.filter(student => student._id !== selectedStudent._id));
      
      setSnackbar({
        open: true,
        message: 'Student removed successfully',
        severity: 'success'
      });
      
      handleCloseModal();
    } catch (err) {
      console.error('Error removing student:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to remove student',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="contained" 
          onClick={fetchStudents}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Remove Students
      </Typography>

      {students.length === 0 ? (
        <Typography>No students available to remove.</Typography>
      ) : (
        students.map((student) => (
          <Paper key={student._id} sx={{ p: 2, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography>
                  <strong>Name:</strong> {student.firstName} {student.lastName}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {student.email}
                </Typography>
                <Typography>
                  <strong>Phone:</strong> {student.phone || 'N/A'}
                </Typography>
                <Typography>
                  <strong>Nationality:</strong> {student.nationality || 'N/A'}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="error"
                onClick={() => handleOpenModal(student)}
              >
                Remove
              </Button>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Paper>
        ))
      )}

      {/* Confirmation Dialog */}
      <Dialog open={openConfirm} onClose={handleCloseModal}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          Are you sure you want to remove{" "}
          <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button color="error" onClick={handleConfirmRemove}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
    </Box>
  );
};

export default RemoveStudents;
