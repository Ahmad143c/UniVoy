import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab
} from "@mui/material";
import image3 from "../assets/images/image3.jpg";
import ConsultantSidebar from "../Components/Consultant/ConsultantSidebar";
import AssignedStudents from "../Components/Consultant/AssignedStudents";
import ReviewApplications from "../Components/Consultant/ReviewApplications"; // already done
import TrackSubmissions from "../Components/Consultant/TrackSubmissions";
import ChatSection from "../Components/Chat/ChatSection";
import Payment from '../Components/Consultant/Payment';
import PaymentReceipts from '../Components/PaymentReceipts';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RbxmS02yyhrp9eeVoTJWmGq6co5eb9T3JDmU5NIbhGXhA29rLaGwpO5iSeKe1ijxiAep2DTImeFEhFkdJ6qzMKg00RUfjiQAg');

const ConsultantDashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
      {/* Sidebar */}
      <ConsultantSidebar activeTab={tabIndex} onTabChange={handleTabChange} />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header Banner */}
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
            Consultant Dashboard
          </Typography>
        </Container>

        {/* Tabs */}
        <Paper sx={{ mb: 2, borderRadius: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="inherit"
            TabIndicatorProps={{
              sx: {
                backgroundColor: "#4CAF50",
                height: 3,
                borderRadius: 1,
              },
            }}
            sx={{
              "& .MuiTab-root": {
                fontWeight: "bold",
                textTransform: "none",
                color: "#25502D",
              },
              "& .Mui-selected": {
                color: "#4CAF50",
              },
              "& .MuiTabs-flexContainer": {
                justifyContent: "center",
                gap: "50px",
              },
            }}
          >
            <Tab label="Assigned Students" />
            <Tab label="Review Applications" />
            <Tab label="Track Submissions" />
            <Tab label="Chat" />
            <Tab label="Payment" />
            <Tab label="Payment Receipts" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabIndex === 0 && <AssignedStudents />}
        {tabIndex === 1 && <ReviewApplications />}
        {tabIndex === 2 && <TrackSubmissions />}
        {tabIndex === 3 && <ChatSection currentUser={JSON.parse(localStorage.getItem('currentUser'))} />}
        {tabIndex === 4 && (
          <Elements stripe={stripePromise}>
            <Payment />
          </Elements>
        )}
        {tabIndex === 5 && <PaymentReceipts />}

      </Box>
    </Box>
  );
};

export default ConsultantDashboard;
