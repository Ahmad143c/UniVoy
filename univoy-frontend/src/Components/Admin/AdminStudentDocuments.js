import React from "react";
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Description, Close } from "@mui/icons-material";
import { API_URL } from '../../Services/api';

const AdminStudentDocuments = ({ open, onClose, documents, loading, studentName }) => {
  // Predefined list of document types matching step 3 of StudentForm
  const documentTypes = [
    { name: 'transcript', label: 'Academic Transcript' },
    { name: 'englishTest', label: 'English Test Certificate' },
    { name: 'experienceletter', label: 'Experience Letter' },
    { name: 'resume', label: 'Resume' },
    { name: 'passport', label: 'Passport' },
    { name: 'referenceletter', label: 'Reference Letter' }
  ];

  // Function to get the correct document URL
  const getDocumentUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative path, prepend the base URL
    const baseUrl = API_URL.split('/api')[0]; // Get base URL without /api
    return `${baseUrl}${url}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      hideBackdrop
      PaperProps={{
        sx: {
          '& .MuiDialogTitle-root': {
            padding: '16px 24px',
            '& .MuiIconButton-root': {
              display: 'none'
            }
          }
        }
      }}
    >
      <DialogTitle sx={{ position: 'relative' }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", display: 'flex', alignItems: 'center', gap: 1 }}>
          Documents - {studentName}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'gray',
            '&:hover': {
              color: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
              <Divider />
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2, 
                mt: 2,
                '& > *': {
                  flex: '1 1 calc(50% - 16px)',
                  minWidth: '300px'
                }
              }}>
                {documentTypes.map((doc) => {
                  const documentUrl = getDocumentUrl(documents?.[doc.name]?.url);
                  return (
                    <Paper
                      key={doc.name}
                      elevation={1}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: documentUrl ? '#edf7ed' : 'white',
                        cursor: documentUrl ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: documentUrl ? '#c8e6c9' : 'white',
                          transform: documentUrl ? 'translateY(-2px)' : 'none',
                          boxShadow: documentUrl ? 3 : 1
                        }
                      }}
                      onClick={() => {
                        if (documentUrl) {
                          let url;
                          if (documentUrl.startsWith('http')) {
                            url = documentUrl;
                          } else if (documentUrl.startsWith('/uploads/')) {
                            url = `http://localhost:5001${documentUrl}`;
                          } else if (documentUrl.startsWith('/files/')) {
                            url = `http://localhost:5001${documentUrl}`;
                          } else {
                            url = `http://localhost:5001/files/${documentUrl.replace(/^\/+/, '')}`;
                          }
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        width: '100%'
                      }}>
                        {documentUrl ? (
                          <Description sx={{ color: '#4CAF50', fontSize: 28 }} />
                        ) : (
                          <Description sx={{ color: 'gray', fontSize: 28 }} />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="subtitle2" 
                            color={documentUrl ? "black" : "text.secondary"}
                            fontWeight={documentUrl ? "bold" : "normal"}
                          >
                            {doc.label}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color={documentUrl ? "success.main" : "text.secondary"}
                          >
                            {documentUrl ? "Click to view document" : "Not uploaded"}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Card>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminStudentDocuments; 