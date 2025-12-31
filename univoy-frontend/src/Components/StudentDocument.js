import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Paper,
  Divider,
  Button,
  Chip,
  Grid,
  IconButton,
  Tooltip
} from "@mui/material";
import { Description, CheckCircle, Pending, Receipt as ReceiptIcon, Download as DownloadIcon, Visibility as VisibilityIcon, Payment as PaymentIcon } from "@mui/icons-material";
import { studentService } from '../Services/studentService';
import { paymentService } from '../Services/paymentService';
import { API_URL } from '../Services/api';

const StudentDocument = () => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [universityDocuments, setUniversityDocuments] = useState([]);
  const [paymentReceipts, setPaymentReceipts] = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);

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

  // Function to get document status chip
  const getDocumentStatusChip = (status) => {
    const statusColors = {
      "Not Reviewed": "default",
      "Under Review": "warning",
      "Complete": "success",
      "Incomplete": "error",
      "Approved": "success",
      "Rejected": "error",
    };

    return (
      <Chip
        label={status || "Not Reviewed"}
        color={statusColors[status] || "default"}
        size="small"
        icon={status === "Complete" || status === "Approved" ? <CheckCircle /> : <Pending />}
        sx={{ fontWeight: 'bold', fontSize: '0.9rem', px: 2, py: 1 }}
      />
    );
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentService.getProfile();
        if (data) {
          setStudentProfile(data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUniversityDocs = async () => {
      try {
        // Get the student profile to get the student _id
        const profile = await studentService.getProfile();
        if (!profile || !profile._id) return;
        const docs = await studentService.getUniversityDocuments(profile._id);
        setUniversityDocuments(docs || []);
      } catch (err) {
        setUniversityDocuments([]);
      }
    };
    fetchUniversityDocs();
  }, []);

  useEffect(() => {
    const fetchPaymentReceipts = async () => {
      try {
        setReceiptsLoading(true);
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
          console.log('No current user found');
          setPaymentReceipts([]);
          return;
        }

        // Check for user ID in both _id and id fields
        const userId = currentUser._id || currentUser.id;
        if (!userId) {
          console.log('No user ID found in currentUser:', currentUser);
          setPaymentReceipts([]);
          return;
        }

        console.log('Fetching receipts for user ID:', userId);
        const response = await paymentService.getPaymentReceipts(userId);
        console.log('Receipts response:', response);
        setPaymentReceipts(response.receipts || []);
      } catch (err) {
        console.error('Error fetching payment receipts:', err);
        setPaymentReceipts([]);
      } finally {
        setReceiptsLoading(false);
      }
    };
    fetchPaymentReceipts();
  }, []);

  const handleViewReceipt = (receipt) => {
    const baseUrl = API_URL.split('/api')[0];
    const fullUrl = `${baseUrl}${receipt.pdfReceiptUrl}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadReceipt = (receipt) => {
    const baseUrl = API_URL.split('/api')[0];
    const fullUrl = `${baseUrl}${receipt.pdfReceiptUrl}`;
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = receipt.pdfReceiptFilename || `receipt_${receipt.receiptNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!studentProfile) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography>No profile data available.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          Documents
        </Typography>
        <Divider />
        
        {/* Document Status Section */}
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#22502C", fontWeight: "bold" }}>
            Document Status
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getDocumentStatusChip(studentProfile.documentStatus)}
            <Typography variant="body2" color="text.secondary">
              {studentProfile.documentStatus === "Not Reviewed" && "Your documents have not been reviewed yet."}
              {studentProfile.documentStatus === "Under Review" && "Your documents are currently being reviewed by your consultant."}
              {studentProfile.documentStatus === "Complete" && "All your documents have been reviewed and are complete."}
              {studentProfile.documentStatus === "Incomplete" && "Some documents are missing or need to be updated."}
              {studentProfile.documentStatus === "Approved" && "Your documents have been approved by your consultant."}
              {studentProfile.documentStatus === "Rejected" && "Your documents have been rejected. Please review and resubmit."}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
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
            const documentUrl = getDocumentUrl(studentProfile?.documents?.[doc.name]?.url);
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
                    window.open(documentUrl, '_blank', 'noopener,noreferrer');
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
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#22502C", fontWeight: "bold" }}>
          University Documents (Consultant Uploads)
        </Typography>
        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : universityDocuments.length === 0 ? (
          <Typography color="text.secondary">No university documents uploaded yet.</Typography>
        ) : (
          <Box>
            {universityDocuments.map((doc, idx) => (
              <Paper key={idx} elevation={1} sx={{ p: 2, mb: 2, borderLeft: '4px solid #4CAF50', borderRadius: 2, bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Description sx={{ color: '#388e3c', fontSize: 32 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight="bold">{doc.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                  {doc.uploadedBy && (
                    <Typography variant="body2" color="text.secondary">
                      By: {doc.uploadedBy.username || doc.uploadedBy.email}
                    </Typography>
                  )}
                </Box>
                <Button
                  href={
                    doc.url.startsWith('/uploads/') || doc.url.startsWith('/files/')
                      ? `http://localhost:5001${doc.url}`
                      : `http://localhost:5001/uploads/${doc.url.replace(/^\/+/, '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ color: '#4CAF50', fontWeight: 'bold' }}
                >
                  View
                </Button>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Payment Receipts Section */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <ReceiptIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
          <Typography variant="h6" sx={{ color: "#22502C", fontWeight: "bold" }}>
            Payment Receipts
          </Typography>
        </Box>
        
        {receiptsLoading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : paymentReceipts.length === 0 ? (
          <Box textAlign="center" py={3}>
            <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No Payment Receipts Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment receipts will appear here once your payments are verified by admin.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {paymentReceipts.map((receipt) => (
              <Grid item xs={12} md={6} lg={4} key={receipt.id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                      borderColor: '#4CAF50'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PaymentIcon sx={{ color: '#4CAF50', fontSize: 24 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#22502C' }}>
                        Receipt #{receipt.receiptNumber}
                      </Typography>
                      <Chip
                        label={receipt.payerType}
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      ${receipt.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment Date: {new Date(receipt.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generated: {new Date(receipt.pdfReceiptGeneratedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Receipt">
                      <IconButton
                        onClick={() => handleViewReceipt(receipt)}
                        size="small"
                        sx={{
                          color: '#4CAF50',
                          border: '1px solid #4CAF50',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.1)'
                          }
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Download Receipt">
                      <IconButton
                        onClick={() => handleDownloadReceipt(receipt)}
                        size="small"
                        sx={{
                          color: '#4CAF50',
                          border: '1px solid #4CAF50',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.1)'
                          }
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default StudentDocument; 