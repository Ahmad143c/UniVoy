import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import axios from "axios";

const AssignConsultant = ({ open, onClose, student, onAssign }) => {
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      fetchConsultants();
      setError(null);
      setSuccess(false);
      setSelectedConsultant("");
    }
  }, [open]);

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Filter only consultants
      const consultantUsers = response.data.filter(user => user.role === 'consultant');
      setConsultants(consultantUsers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching consultants:", err);
      setError(err.response?.data?.message || "Failed to fetch consultants");
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedConsultant) {
      setError("Please select a consultant");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const token = localStorage.getItem("token");
      
      const response = await axios.put(
        `http://localhost:5001/api/students/${student._id}/assign-consultant`,
        { consultantId: selectedConsultant },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setLoading(false);
        // Wait a moment to show the success message
        setTimeout(() => {
          onAssign();
          handleClose();
        }, 1000);
      }
    } catch (err) {
      console.error("Error assigning consultant:", err);
      setError(err.response?.data?.message || "Failed to assign consultant");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setSelectedConsultant("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Consultant</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Consultant assigned successfully!
          </Alert>
        )}
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Consultant</InputLabel>
            <Select
              value={selectedConsultant}
              onChange={(e) => setSelectedConsultant(e.target.value)}
              label="Select Consultant"
            >
              {consultants.map((consultant) => (
                <MenuItem key={consultant._id} value={consultant._id}>
                  {consultant.profile?.firstName} {consultant.profile?.lastName} - {consultant.profile?.specialization}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          color="primary"
          disabled={loading || !selectedConsultant}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignConsultant;