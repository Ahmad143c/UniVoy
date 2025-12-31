import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [consultantId, setConsultantId] = useState('');
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
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5001/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to fetch students');
      setLoading(false);
    }
  };

  const handleAssignConsultant = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.put(
        `http://localhost:5001/api/students/${selectedStudent._id}/assign-consultant`,
        { consultantId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({
        open: true,
        message: 'Consultant assigned successfully',
        severity: 'success'
      });
      setOpenDialog(false);
      fetchStudents();
    } catch (err) {
      console.error('Error assigning consultant:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to assign consultant',
        severity: 'error'
      });
    }
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
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#25502D', fontWeight: 'bold' }}>
          Manage Students
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#25502D' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#25502D' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#25502D' }}>Nationality</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#25502D' }}>Education Level</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#25502D' }}>Assigned Consultant</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#25502D' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.profile?.firstName} {student.profile?.lastName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.profile?.nationality || 'N/A'}</TableCell>
                  <TableCell>{student.profile?.educationLevel || 'N/A'}</TableCell>
                  <TableCell>
                    {student.profile?.assignedConsultant?.username || 'Not assigned'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedStudent(student);
                        setOpenDialog(true);
                      }}
                    >
                      Assign Consultant
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Assign Consultant</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Consultant ID"
            type="text"
            fullWidth
            value={consultantId}
            onChange={(e) => setConsultantId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignConsultant} color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageStudents; 