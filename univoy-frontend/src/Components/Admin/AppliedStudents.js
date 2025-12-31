// src/Components/Admin/AppliedStudents.js
import React, { useEffect, useState } from "react";
import { Box, Card, Typography, Avatar, CircularProgress, Chip } from "@mui/material";
import axios from "axios";

const AppliedStudents = () => {
  const [appliedStudents, setAppliedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppliedStudents();
  }, []);

  const fetchAppliedStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5001/api/students/applied", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAppliedStudents(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching applied students:", err);
      setError(err.response?.data?.message || "Failed to fetch applied students");
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
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ✅ Students Applied by Consultants
      </Typography>

      {appliedStudents.length === 0 ? (
        <Typography>No students have been applied by consultants yet.</Typography>
      ) : (
        appliedStudents.map((student) => (
          <Card
            key={student._id}
            sx={{
              p: 2,
              mb: 2,
              borderLeft: "5px solid #4CAF50",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              sx={{ bgcolor: "#4CAF50", width: 56, height: 56 }}
              src={student.profilePicture}
            >
              {student.firstName?.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {student.firstName} {student.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {student.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: ✅ Applied by Consultant
              </Typography>
              {student.assignedConsultantName && (
                <Typography variant="body2" color="text.secondary">
                  Consultant: {student.assignedConsultantName}
                </Typography>
              )}
              {student.applicationSubmittedAt ? (
                <Typography variant="body2" color="text.secondary">
                  Applied On: {new Date(student.applicationSubmittedAt).toLocaleDateString()}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Applied On: {new Date(student.consultantAssignedAt || student.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
            <Chip 
              label="Applied" 
              color="success" 
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </Card>
        ))
      )}
    </Box>
  );
};

export default AppliedStudents;
