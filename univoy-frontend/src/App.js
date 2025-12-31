import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./Pages/Home"; // Home page component
import About from "./Pages/About"; // About page component
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import dashboard components
import AdminDashboard from "./Pages/AdminDashboard";
import ConsultantDashboard from "./Pages/ConsultantDashboard";
import StudentDashboard from "./Pages/StudentDashboard";
import StudentProfile from "./Components/Admin/AdminStudentProfile";
import ConsultantStudentProfile from "./Components/Consultant/ConsultantStudentProfile";

const theme = createTheme({
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

// ProtectedRoute component to restrict access based on user role
const ProtectedRoute = ({ children, role }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser || currentUser.role !== role) {
    // Redirect to login page if user is not logged in or doesn't have the correct role
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          {/* Header will always be visible */}
          

          {/* Define the routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/student/:studentId"
              element={
                <ProtectedRoute role="admin">
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultant-dashboard"
              element={
                <ProtectedRoute role="consultant">
                  <ConsultantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultant-dashboard/student/:studentId"
              element={
                <ProtectedRoute role="consultant">
                  <ConsultantStudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultant/chat"
              element={
                <ProtectedRoute role="consultant">
                  <ConsultantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/chat"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>

          {/* Footer will always be visible */}
          
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
