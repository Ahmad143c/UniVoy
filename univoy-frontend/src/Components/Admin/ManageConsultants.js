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
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

const ManageConsultants = () => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Registered Consultants
      </Typography>
      <Paper elevation={3} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Specialization</strong></TableCell>
              <TableCell><strong>Experience</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consultants.map((consultant) => (
              <TableRow key={consultant._id}>
                <TableCell>
                  {consultant.profile?.firstName} {consultant.profile?.lastName}
                </TableCell>
                <TableCell>{consultant.email}</TableCell>
                <TableCell>{consultant.profile?.phone || "N/A"}</TableCell>
                <TableCell>{consultant.profile?.specialization || "N/A"}</TableCell>
                <TableCell>{consultant.profile?.experience || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ManageConsultants;

