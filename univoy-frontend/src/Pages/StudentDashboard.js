import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Tabs, Tab, Alert, Snackbar } from "@mui/material";
import StudentSidebar from "../Components/Student/StudentSidebar";
import StudentForm from "../Components/StudentForm";
import StudentProfile from "../Components/StudentProfile"; 
import AppliedUniversity from "../Components/AppliedUniversity";
import CourseSearch from "../Components/CourseSearch";
import StudentDocument from "../Components/StudentDocument";
import ChatSection from "../Components/Chat/ChatSection";
import Payment from '../Components/Student/Payment';
import PaymentReceipt from '../Components/Student/PaymentReceipt';
import FeedbackForm from '../Components/Feedback/FeedbackForm';
import { feedbackService } from '../Services/feedbackService';
import image3 from "../assets/images/image3.jpg";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RbxmS02yyhrp9eeVoTJWmGq6co5eb9T3JDmU5NIbhGXhA29rLaGwpO5iSeKe1ijxiAep2DTImeFEhFkdJ6qzMKg00RUfjiQAg');

const StudentDashboard = () => {
  const [profileComplete, setProfileComplete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "error"
  });
  const [paymentMade, setPaymentMade] = useState(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.email) {
      return localStorage.getItem(`paymentMade_${currentUser.email}`) === "true";
    }
    return false;
  });

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.email) {
      // Check if profile exists in localStorage
      const hasProfile = localStorage.getItem(`profileComplete_${currentUser.email}`);
      setProfileComplete(hasProfile === "true");
      
      // If no profile exists, show the form by default
      if (!hasProfile) {
        setIsEditing(true);
      }
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      console.log('Submitting feedback with data:', feedbackData);
      console.log('Token from localStorage:', localStorage.getItem('token'));
      console.log('Current user from localStorage:', localStorage.getItem('currentUser'));
      await feedbackService.submitFeedback(feedbackData);
      setAlert({
        open: true,
        message: "Feedback submitted successfully! Thank you for your input.",
        severity: "success"
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      console.error('Error response:', error.response);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to submit feedback. Please try again.",
        severity: "error"
      });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
      <StudentSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <Box sx={{ flexGrow: 1, p: 3 }}>
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
            Student Dashboard
          </Typography>
        </Container>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              // Prevent navigating to Payment tab if payment is made
              if (paymentMade && newValue === (paymentMade ? 5 : 5)) return;
              setActiveTab(newValue);
            }}
            centered
            textColor="inherit"
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{
              "& .MuiTabs-flexContainer": {
                justifyContent: "center",
                gap: "150px",
              },
              "& .MuiTab-root": {
                color: "#25502D",
                fontWeight: "bold",
                transition: "color 0.3s",
                padding: "12px 24px",
                borderRadius: "8px",
                marginBottom: "5px",
              },
              "& .Mui-selected": {
                color: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                borderBottom: "3px solid",
                borderColor: "#4CAF50",
              },
              "& .MuiTab-root:hover": {
                color: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
              },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Documents" />
            <Tab label="Course Search" />
            <Tab label="Applied University" />
            <Tab label="Chat" />
            <Tab label="Feedback" />
            {/* Only show Payment tab if payment is not made */}
            {!paymentMade && <Tab label="Payment Receipt" />}
          </Tabs>
        </Box>

        {!profileComplete || isEditing ? (
          <>
            <Typography variant="h5" textAlign="center" mb={2} color="primary">
              {isEditing ? "Edit Your Profile" : "Please complete your profile"}
            </Typography>
            <StudentForm
              onClose={() => {
                setProfileComplete(true);
                setIsEditing(false);
                const currentUser = JSON.parse(localStorage.getItem("currentUser"));
                if (currentUser && currentUser.email) {
                  localStorage.setItem(`profileComplete_${currentUser.email}`, "true");
                }
              }}
            />
          </>
        ) : (
          <>
            {activeTab === 0 && (isEditing ? <StudentForm onComplete={() => setIsEditing(false)} /> : <StudentProfile onEdit={handleEditProfile} />)}
            {activeTab === 1 && <StudentDocument />}
            {activeTab === 2 && <CourseSearch onApplicationSubmitted={() => {
              if (!paymentMade) {
                setActiveTab(6);
              }
            }} />}
            {activeTab === 3 && <AppliedUniversity />}
            {activeTab === 4 && <ChatSection currentUser={JSON.parse(localStorage.getItem('currentUser'))} />}
            {activeTab === 5 && <FeedbackForm onSubmit={handleFeedbackSubmit} currentUser={(() => {
              const user = JSON.parse(localStorage.getItem('currentUser'));
              console.log('StudentDashboard - currentUser from localStorage:', user);
              return user;
            })()} />}
            {activeTab === 6 && !paymentMade && (
              <PaymentReceipt />
            )}
          </>
        )}

        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: "100%" }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
