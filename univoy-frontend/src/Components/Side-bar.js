import React, { useState } from "react";
import { Drawer, List, Box, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Home, Search, Public, School, Layers, Group } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import sidefavicon from "../assets/favicon.png";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { text: "Home", icon: <Home />, path: "/dashboard" },
    { text: "Courses", icon: <Search />, path: "/course-search" },
    { text: "Countries", icon: <Public />, path: "/countries" },
    { text: "Students", icon: <School />, path: "/students" },
    { text: "Applications", icon: <Layers />, path: "/application-stages" },
    { text: "Teams", icon: <Group />, path: "/teams" },
  ];

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setOpen(true)} // Open when hovered
      onMouseLeave={() => setOpen(false)} // Close when cursor leaves
      sx={{
        width: open ? 210 : 60,
        transition: "width 0.3s",
        "& .MuiDrawer-paper": {
          width: open ? 210 : 60,
          transition: "width 0.3s",
          boxSizing: "border-box",
          backgroundColor: "#F8F9FA",
          color: "#264E2B",
          overflowX: "hidden",
        },
      }}
    >
      {/* Logo Section */}
      <Box component={Link} // Use Link to navigate to home page
        to="/" sx={{ display: "flex", alignItems: "center", justifyContent: open ? "flex-start" : "center", p: "7px" }}>
        <img src={sidefavicon} alt="Logo" style={{ width: open ? "50px" : "50px", transition: "width 0.3s" }} />
        {open && <img src={logo} alt="Logo" style={{ width: "110px", transition: "width 0.3s" }} />}
      </Box>

      {/* Sidebar Menu */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "flex", justifyContent: "center" }}>
            <ListItemButton onClick={() => navigate(item.path)} sx={{ justifyContent: open ? "start" : "center" }}>
              <ListItemIcon sx={{ color: "#21502B", minWidth: "30px", py: "5px" }}>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
