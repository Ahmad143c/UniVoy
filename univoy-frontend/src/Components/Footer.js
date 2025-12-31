import React from "react";

import { Box, Typography } from "@mui/material";


const Footer = () => {
    return (
        <Box
            sx={{
                backgroundColor: "#4caf50",
                padding: '21px',
                position: "fixed",
                bottom: 0,
                width: "100%",

            }}>
            <Typography variant="body2" color="white" align="center">
                © {new Date().getFullYear()} UniVoy. All Rights Reserved.
            </Typography>
        </Box>
    );
};

export default Footer;
