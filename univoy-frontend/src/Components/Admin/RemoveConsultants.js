import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";

const RemoveConsultants = () => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5001/api/consultants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConsultants(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching consultants:", err);
      setError(err.response?.data?.message || "Failed to fetch consultants");
      setLoading(false);
    }
  };

  const handleRemoveClick = (consultant) => {
    setSelectedConsultant(consultant);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      await axios.delete(`http://localhost:5001/api/consultants/${selectedConsultant._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Consultant removed successfully");
      setConfirmOpen(false);
      fetchConsultants(); // Refresh the list
    } catch (err) {
      console.error("Error removing consultant:", err);
      setError(err.response?.data?.message || "Failed to remove consultant");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Assigned Students</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consultants.length > 0 ? (
              consultants.map((consultant) => (
                <TableRow key={consultant._id}>
                  <TableCell>
                    {consultant.profile?.firstName} {consultant.profile?.lastName}
                  </TableCell>
                  <TableCell>{consultant.email}</TableCell>
                  <TableCell>{consultant.profile?.specialization || "N/A"}</TableCell>
                  <TableCell>
                    {consultant.profile?.assignedStudents?.length || 0} students
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveClick(consultant)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No consultants found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {selectedConsultant?.profile?.firstName} {selectedConsultant?.profile?.lastName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRemove} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RemoveConsultants; 