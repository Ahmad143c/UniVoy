import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, Card, CardMedia, Stack, Divider, CircularProgress } from "@mui/material";
import { LocationOn, AttachMoney, Event, CheckCircle } from "@mui/icons-material";
import { studentService } from '../Services/studentService';
import defaultImage from "../assets/images/default.png";

  import { paymentService } from '../Services/paymentService';

  const AppliedUniversity = () => {
    const [appliedUniversities, setAppliedUniversities] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getImageUrl = (imageName) => {
      if (!imageName) return defaultImage;
      if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
        return imageName;
      }
      if (imageName.startsWith('/uploads/') || imageName.startsWith('/assets/')) {
        return `http://localhost:5001${imageName}`;
      }
      try {
        return require(`../assets/images/${imageName}`);
      } catch (err) {
        return defaultImage;
      }
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          const [applications, paymentList] = await Promise.all([
            studentService.getApplications(),
            paymentService.getPayments()
          ]);
          setAppliedUniversities(applications || []);
          setPayments(paymentList || []);
        } catch (err) {
          setError('Failed to load applications data');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);

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

    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Applied Universities:
        </Typography>
        {appliedUniversities.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: { xs: "flex-start", md: "space-between" } }}>
            {appliedUniversities
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((application, index) => (
                <Card key={index} sx={{ width: { xs: "100%", sm: "48%", md: "32%" }, p: 2, boxShadow: 3, borderRadius: 3 }}>
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                    <CardMedia
                      component="img"
                      image={getImageUrl(application.universityData.image)}
                      alt={application.universityData.name}
                      sx={{ width: { xs: "100%", sm: 120 }, height: 100, objectFit: "cover", borderRadius: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {application.universityData.name}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {application.universityData.title}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                        <Chip icon={<LocationOn fontSize="small" />} label={application.universityData.location} color="success" size="small" variant="outlined" />
                        <Chip icon={<AttachMoney fontSize="small" />} label={`Tuition Fee: ${application.universityData.tuition_fee}`} color="success" size="small" variant="outlined" />
                        <Chip icon={<Event fontSize="small" />} label={`Intake: ${application.universityData.intake}`} color="success" size="small" variant="outlined" />
                        <Chip icon={<CheckCircle fontSize="small" />} label={`Status: ${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`} color={application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'error' : 'warning'} size="small" />
                        {(() => {
                          const payment = payments.find(p => p.courseId === application.courseId);
                          if (payment) {
                            if (payment.status === 'Verified') {
                              return <Chip label="Verified" color="success" size="small" variant="outlined" />;
                            } else {
                              return <Chip label="Verifying" color="warning" size="small" variant="outlined" />;
                            }
                          } else {
                            return <Chip label="Unpaid" color="warning" size="small" variant="outlined" />;
                          }
                        })()}
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              ))}
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 'bold' }}>
            No applied universities found.
          </Typography>
        )}
      </Box>
    );
};

export default AppliedUniversity;
