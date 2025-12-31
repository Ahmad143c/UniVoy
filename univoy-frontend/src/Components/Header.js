import React from "react";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom"; // Import Link for navigation

const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#ffffff" }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Logo - Linked to Home */}
        <Box
          component={Link} // Use Link to navigate to home page
          to="/"
          sx={{
            width: "200px",
            display: "block",
          }}
        >
          <Box
            component="img"
            src="./logo.jpg"
            alt="UniVoy Logo"
            sx={{
              width: "100%",
              cursor: "pointer",
            }}
          />
        </Box>

        {/* Navigation Buttons */}
        <Box display="flex" gap={2}>
          <Box>
            {/* Home Button */}
            <Button component={Link} to="/" sx={{
                color: "#21502E",
            }}>
              Home
            </Button>

            {/* About Button */}
          
          </Box>

          {/* Login and Sign-Up Buttons */}
          <Button component={Link} to="/Login"
            variant="contained"
            sx={{
              backgroundColor: "#4caf50",
              "&:hover": { backgroundColor: "#45a049" },
            }}
          >
            Login
          </Button>
          <Button component={Link} to="/Signup"
            variant="contained"
            sx={{
              backgroundColor: "#4caf50",
              "&:hover": { backgroundColor: "#45a049" },
            }}
          >
            Sign-up
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
