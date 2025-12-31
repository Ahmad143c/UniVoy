import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Card,
} from "@mui/material";
import {
  Email,
  Phone,
  Public,
  LocationOn,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AllConsultants = () => {
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [assignedStudentsOpen, setAssignedStudentsOpen] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [assignedStudentsLoading, setAssignedStudentsLoading] = useState(false);

  const buttonStyles = {
    color: "#ffff",
    backgroundColor: "#4CAF50",
    "&:hover": { backgroundColor: "#388E3C" },
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5001/api/consultants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConsultants(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching consultants:", err);
      setError(err.response?.data?.message || "Failed to fetch consultants");
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (selectedConsultant) {
      setEditData({
        firstName: selectedConsultant.profile?.firstName || "",
        lastName: selectedConsultant.profile?.lastName || "",
        email: selectedConsultant.email,
        phone: selectedConsultant.profile?.phone || "",
        specialization: selectedConsultant.profile?.specialization || "",
        experience: selectedConsultant.profile?.experience || "",
      });
      setEditOpen(true);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      await axios.put(
        `http://localhost:5001/api/consultants/${selectedConsultant._id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the consultants list
      fetchConsultants();
      setEditOpen(false);
    } catch (err) {
      console.error("Error updating consultant:", err);
      setError(err.response?.data?.message || "Failed to update consultant");
    }
  };

  const handleViewAssignedStudents = async () => {
    if (!selectedConsultant) return;
    
    try {
      setAssignedStudentsLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await axios.get(
        `http://localhost:5001/api/consultants/${selectedConsultant._id}/assigned-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Debug: Log the response data to understand the structure
      console.log('Assigned students response:', response.data);
      
      // Fetch complete student data for each assigned student
      const completeStudentData = await Promise.all(
        (response.data || []).map(async (student) => {
          try {
            const studentResponse = await axios.get(
              `http://localhost:5001/api/students/${student._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            return studentResponse.data;
          } catch (err) {
            console.error(`Error fetching complete data for student ${student._id}:`, err);
            return student; // Return original data if fetch fails
          }
        })
      );
      
      setAssignedStudents(completeStudentData);
      setAssignedStudentsOpen(true);
    } catch (err) {
      console.error("Error fetching assigned students:", err);
      setError(err.response?.data?.message || "Failed to fetch assigned students");
    } finally {
      setAssignedStudentsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        All Registered Consultants
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Specialization</strong></TableCell>
              <TableCell><strong>Experience</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consultants.map((consultant) => (
              <TableRow
                key={consultant._id}
                hover
                onClick={() => setSelectedConsultant(consultant)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  {consultant.profile?.firstName || ""} {consultant.profile?.lastName || ""}
                </TableCell>
                <TableCell>{consultant.email}</TableCell>
                <TableCell>{consultant.profile?.specialization || "N/A"}</TableCell>
                <TableCell>{consultant.profile?.experience || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {selectedConsultant && (
        <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#4CAF50", fontWeight: "bold" }}>
            Consultant Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Name:</strong> {selectedConsultant.profile?.firstName} {selectedConsultant.profile?.lastName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Email:</strong> {selectedConsultant.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Phone:</strong> {selectedConsultant.profile?.phone || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Specialization:</strong> {selectedConsultant.profile?.specialization || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Experience:</strong> {selectedConsultant.profile?.experience || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Assigned Students:</strong> {selectedConsultant.profile?.assignedStudents?.length || 0}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" sx={buttonStyles} onClick={handleOpenEdit}>
              Edit Details
            </Button>
            <Button 
              variant="outlined" 
              sx={buttonStyles}
              onClick={handleViewAssignedStudents}
              disabled={assignedStudentsLoading}
            >
              {assignedStudentsLoading ? "Loading..." : "View Assigned Students"}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Edit Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Consultant Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={editData.firstName}
              onChange={handleEditChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={editData.lastName}
              onChange={handleEditChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={editData.email}
              onChange={handleEditChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={editData.phone}
              onChange={handleEditChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Specialization"
              name="specialization"
              value={editData.specialization}
              onChange={handleEditChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Experience"
              name="experience"
              value={editData.experience}
              onChange={handleEditChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assigned Students Modal */}
      <Dialog 
        open={assignedStudentsOpen} 
        onClose={() => setAssignedStudentsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: "#4CAF50", fontWeight: "bold" }}>
            Assigned Students - {selectedConsultant?.profile?.firstName} {selectedConsultant?.profile?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Students: {assignedStudents.length}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {assignedStudentsLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : assignedStudents.length > 0 ? (
            <Grid container spacing={2}>
              {assignedStudents.map((student, index) => (
                <Grid item xs={12} sm={6} md={4} key={student._id || index}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      '&:hover': { 
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                    onClick={() => {
                      // Navigate to admin student profile
                      navigate(`/admin/student/${student._id}`);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        src={
                          student.profilePicture ? 
                            (student.profilePicture.startsWith('http') ? 
                              student.profilePicture : 
                              `http://localhost:5001${student.profilePicture}`
                            ) : 
                            undefined
                        }
                        sx={{ 
                          bgcolor: '#4CAF50', 
                          mr: 2,
                          width: 56,
                          height: 56
                        }}
                      >
                        {student.firstName?.[0]}{student.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {student.firstName} {student.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: #{student._id?.slice(-6).toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 'small', color: '#4CAF50' }} />
                        <Typography variant="body2">
                          {student.email || "Email not provided"}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 'small', color: '#4CAF50' }} />
                        <Typography variant="body2">
                          {student.phone || "Phone not provided"}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Public sx={{ fontSize: 'small', color: '#4CAF50' }} />
                        <Typography variant="body2">
                          {student.nationality || "Nationality not provided"}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 'small', color: '#4CAF50' }} />
                        <Typography variant="body2">
                          {student.residenceCountry || "Residence not provided"}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={student.status || 'Active'}
                        color={
                          student.status === 'Active' ? 'success' :
                          student.status === 'Inactive' ? 'error' :
                          'default'
                        }
                        size="small"
                      />
                      {student.applicationStatus && (
                        <Chip
                          label={student.applicationStatus}
                          color={
                            student.applicationStatus === 'Applied' ? 'success' :
                            student.applicationStatus === 'Rejected' ? 'error' :
                            student.applicationStatus === 'In Progress' ? 'warning' :
                            'default'
                          }
                          size="small"
                        />
                      )}
                      {student.documentStatus && (
                        <Chip
                          label={student.documentStatus}
                          color={
                            student.documentStatus === 'Complete' ? 'success' :
                            student.documentStatus === 'Incomplete' ? 'error' :
                            'warning'
                          }
                          size="small"
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/student/${student._id}`);
                        }}
                        sx={{ 
                          color: '#4CAF50', 
                          borderColor: '#4CAF50',
                          '&:hover': { 
                            backgroundColor: '#4CAF50',
                            color: 'white'
                          }
                        }}
                      >
                        View Profile
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" variant="h6">
                No students assigned to this consultant.
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Students will appear here once they are assigned to this consultant.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAssignedStudentsOpen(false)}
            sx={{ color: '#4CAF50' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllConsultants; 