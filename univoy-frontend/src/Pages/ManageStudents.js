import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import AllStudents from "../Components/Admin/AllStudents";
import AppliedStudents from "../Components/Admin/AppliedStudents";
import RemoveStudents from "../Components/Admin/RemoveStudents";

const ManageStudents = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      {/* Tab Header */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          mb: 3,
          px: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
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
              color: "#25502D",
              textTransform: "none",
              px: 2,
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
          <Tab label="All Students" />
          <Tab label="Applied Students" />
          <Tab label="Remove Students" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {tabIndex === 0 && <AllStudents />}
        {tabIndex === 1 && <AppliedStudents />}
        {tabIndex === 2 && <RemoveStudents />}
      </Box>
    </Box>
  );
};

export default ManageStudents;
