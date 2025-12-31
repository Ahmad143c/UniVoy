import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import ChatSection from '../Chat/ChatSection';

const DashboardContent = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {currentUser?.username || 'Admin'}
        </Typography>
        <ChatSection currentUser={currentUser} />
      </Box>
    </Container>
  );
};

export default DashboardContent; 