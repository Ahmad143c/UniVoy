import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
} from "@mui/material";
import AdminSidebar from "../Components/Admin/AdminSidebar";
import ManageStudents from "./ManageStudents";
import ManageConsultants from "./ManageConsultants";
import ChatSection from "../Components/Chat/ChatSection";
import Payment from '../Components/Admin/Payment';
import image3 from "../assets/images/image3.jpg";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [userError, setUserError] = useState(null);

  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser');
      if (user) {
        const parsedUser = JSON.parse(user);
        console.log('Parsed currentUser:', parsedUser);
        setCurrentUser(parsedUser);
        setUserError(null);
      } else {
        setUserError('No user data found. Please log in again.');
      }
    } catch (error) {
      console.error('Error parsing currentUser:', error);
      setUserError('Error loading user data. Please log in again.');
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        {/* Header section with background image */}
        <Container
          maxWidth={false}
          sx={{
            height: { xs: "6vh", md: "12vh" },
            background: "#4CAF50",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            boxShadow: "0 8px 32px 0 rgba(76,175,80,0.25), 0 1.5px 0 #fff inset, 0 2px 16px 0 rgba(44,62,80,0.10)",
            border: "2px solid #22502c",
            position: "relative",
            overflow: "hidden",
            '::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(120deg, rgba(76,175,80,0.10) 0%, rgba(255,255,255,0.04) 100%)',
              pointerEvents: 'none',
              borderRadius: 3,
            },
          }}
        >
          <Typography
            variant="h4"
            color="white"
            sx={{
              fontWeight: "bold",
              textShadow: "2px 2px 8px rgba(44,62,80,0.5)",
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            Admin Dashboard
          </Typography>
        </Container>

        {/* Tab Navigation */}
        <Paper elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            textColor="inherit"
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{
              "& .MuiTabs-flexContainer": {
                justifyContent: "center",
                gap: { xs: "40px", md: "150px" },
              },
              "& .MuiTab-root": {
                color: "#25502D",
                fontWeight: "bold",
                px: 3,
                py: 1.5,
                borderRadius: "8px",
                transition: "all 0.3s",
              },
              "& .Mui-selected": {
                color: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                borderBottom: "3px solid #4CAF50",
              },
              "& .MuiTab-root:hover": {
                backgroundColor: "rgba(76, 175, 80, 0.08)",
                color: "#4CAF50",
              },
            }}
          >
            <Tab label="Manage Students" />
            <Tab label="Manage Consultants" />
            <Tab label="Chat" />
            <Tab label="Payment" />
          </Tabs>
        </Paper>

        {/* User Error Alert */}
        {userError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {userError}
          </Alert>
        )}

        {/* Tab Content */}
        <Box>
          {activeTab === 0 && <ManageStudents />}
          {activeTab === 1 && <ManageConsultants />}
          {activeTab === 2 && <ChatSection currentUser={currentUser} />}
          {activeTab === 3 && <Payment />}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;