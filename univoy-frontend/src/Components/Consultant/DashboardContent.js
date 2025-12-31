import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import AssignedStudents from "./AssignedStudents";
import ChatSection from '../Chat/ChatSection';

const DashboardContent = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            My Assigned Students
          </Typography>
          <AssignedStudents />
        </Paper>
      </Box>

      <Box sx={{ p: 3 }}>
        <ChatSection currentUser={currentUser} />
      </Box>
    </Box>
  );
};

export default DashboardContent; 