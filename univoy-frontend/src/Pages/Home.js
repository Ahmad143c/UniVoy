import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import Header from "../Components/Header";
import { Container, Box, Typography, Button } from "@mui/material";
import image1 from "../assets/images/image1.jpg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <Header />
      {/* Hero Section with Background Image */}
      <Container
        maxWidth={false}
        sx={{
          height: { xs: "50vh", md: "70vh" }, // Responsive height
          backgroundImage: `url(${image1})`,
          backgroundSize: "cover",
          backgroundPosition: { xs: "center", md: "right" },
          mt: 1,
          backgroundRepeat: "no-repeat",
        }}
      >
        <Box py={{ xs: 15, md: 25 }} px={8}>
          {/* Hero Heading */}
          <Typography variant="h4" color="#4caf50" gutterBottom>
            Set Out Confidently on Your Global
            <br />
            Education Journey
          </Typography>

          {/* Hero Subtext */}
          <Typography sx={{ lineHeight: 1.5 }}>
            Discover universities, apply with ease, and achieve your dream
            <br />
            of global education with UniVoy – your
            <br />
            trusted study abroad partner.
          </Typography>

          {/* Call-to-Action Buttons */}
          <Box display="flex" gap={2} pt={3}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#45a049" },
              }}
              onClick={() => navigate("/about")}
            >
              About us
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#45a049" },
              }}
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
