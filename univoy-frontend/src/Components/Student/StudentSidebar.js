import React, { useState } from "react";
import { Drawer, List, Box, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { Home, Search, Description, School, Chat, Logout, Feedback } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import sidefavicon from "../../assets/favicon.png";
import { Link } from "react-router-dom";

const StudentSidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { text: "Overview", icon: <Home />, tabIndex: 0 },
    { text: "Documents", icon: <Description />, tabIndex: 1 },
    { text: "Course Search", icon: <Search />, tabIndex: 2 },
    { text: "Applied University", icon: <School />, tabIndex: 3 },
    { text: "Chat", icon: <Chat />, tabIndex: 4 },
    { text: "Feedback", icon: <Feedback />, tabIndex: 5 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
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
      <Box component={Link}
        to="/"
        sx={{ display: "flex", alignItems: "center", justifyContent: open ? "flex-start" : "center", p: "7px" }}
      >
        <img src={sidefavicon} alt="Logo" style={{ width: open ? "50px" : "50px", transition: "width 0.3s" }} />
        {open && <img src={logo} alt="Logo" style={{ width: "110px", transition: "width 0.3s" }} />}
      </Box>

      {/* Sidebar Menu */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "flex", justifyContent: "center" }}>
            <ListItemButton 
              onClick={() => onTabChange(null, item.tabIndex)} 
              sx={{ 
                justifyContent: open ? "start" : "center",
                backgroundColor: activeTab === item.tabIndex ? "rgba(76, 175, 80, 0.1)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(76, 175, 80, 0.08)",
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: activeTab === item.tabIndex ? "#4CAF50" : "#21502B", 
                  minWidth: "30px", 
                  py: "5px" 
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    color: activeTab === item.tabIndex ? "#4CAF50" : "inherit",
                    fontWeight: activeTab === item.tabIndex ? "bold" : "normal"
                  }} 
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ backgroundColor: "rgba(0, 0, 0, 0.12)" }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              "&:hover": {
                backgroundColor: "rgba(76, 175, 80, 0.08)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: "#4CAF50",
              }}
            >
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                opacity: open ? 1 : 0,
                color: "#4CAF50",
                fontWeight: "medium",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default StudentSidebar; 