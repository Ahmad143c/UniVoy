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
  CircularProgress,
  Alert,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from "@mui/material";
import AssignConsultant from "./AssignConsultant";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import AdminStudentDocuments from './AdminStudentDocuments';

const buttonStyles = {
  color: "#ffff",
  backgroundColor: "#4CAF50",
  "&:hover": { backgroundColor: "#388E3C" },
};

const cancelButtonStyles = {
  color: "#4CAF50",
  borderColor: "#4CAF50",
  "&:hover": { 
    borderColor: "#388E3C",
    backgroundColor: "rgba(76, 175, 80, 0.1)"
  },
};

const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#4CAF50",
    },
    "&:hover fieldset": {
      borderColor: "#388E3C",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#4CAF50",
    },
  },
  "& .MuiInputLabel-root": {
    "&.Mui-focused": {
      color: "#4CAF50",
    },
  },
};

const selectStyles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#4CAF50",
    },
    "&:hover fieldset": {
      borderColor: "#388E3C",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#4CAF50",
    },
  },
  "& .MuiInputLabel-root": {
    "&.Mui-focused": {
      color: "#4CAF50",
    },
  },
  "& .MuiSelect-icon": {
    color: "#4CAF50",
  },
};

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewDocsOpen, setViewDocsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [assignConsultantOpen, setAssignConsultantOpen] = useState(false);
  const [documents, setDocuments] = useState({});
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchConsultants();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      console.log('Fetching students with token:', token.substring(0, 10) + '...');

      const response = await axios.get("http://localhost:5001/api/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Students response:', response.data);

      if (response.data) {
        setStudents(response.data);
      } else {
        setError("No data received from server");
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
        setError("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", err.message);
        setError("Failed to fetch students: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultants = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await axios.get("http://localhost:5001/api/consultants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setConsultants(response.data);
      }
    } catch (err) {
      console.error("Error fetching consultants:", err);
      if (err.response) {
        setError(err.response.data?.message || `Error fetching consultants: ${err.response.status}`);
      } else {
        setError("Failed to fetch consultants. Please try again later.");
      }
    }
  };

  const fetchStudentDocuments = async (studentId) => {
    try {
      setDocumentsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5001/api/students/${studentId}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDocuments(response.data);
      setDocumentsLoading(false);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.response?.data?.message || "Failed to fetch documents");
      setDocumentsLoading(false);
    }
  };

  const handleOpenViewDocs = async () => {
    if (selectedStudent) {
      await fetchStudentDocuments(selectedStudent._id);
      setViewDocsOpen(true);
    }
  };

  const handleOpenEdit = () => {
    if (selectedStudent) {
      // Initialize edit data with the correct field values
      setEditData({
        firstName: selectedStudent.firstName || '',
        lastName: selectedStudent.lastName || '',
        email: selectedStudent.email || '',
        phone: selectedStudent.phone || '',
        nationality: selectedStudent.nationality || '',
        residenceCountry: selectedStudent.residenceCountry || '',
        educationLevel: selectedStudent.educationLevel || '',
        completionYear: selectedStudent.completionYear || '',
        educationCountry: selectedStudent.educationCountry || '',
        obtainedMarksAndCgpa: selectedStudent.obtainedMarksAndCgpa || '',
        totalMarksAndCgpa: selectedStudent.totalMarksAndCgpa || ''
      });
      setEditOpen(true);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      console.log('Updating student with data:', editData);
      
      const response = await axios.put(
        `http://localhost:5001/api/students/${selectedStudent._id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data && response.data.success) {
        setSuccess("Student updated successfully");
        setEditOpen(false);
        fetchStudents(); // Refresh the list
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to update student");
      }
    } catch (err) {
      console.error("Error updating student:", err);
      if (err.response) {
        setError(err.response.data?.message || `Error updating student: ${err.response.status}`);
      } else {
        setError("Failed to update student. Please try again later.");
      }
    }
  };

  const handleAssignConsultant = async () => {
    try {
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      if (!selectedStudent || !selectedConsultant) {
        setError("Please select both a student and a consultant");
        return;
      }

      console.log('Assigning consultant:', {
        studentId: selectedStudent._id,
        consultantId: selectedConsultant
      });

      // Validate the consultant ID
      const consultant = consultants.find(c => c._id === selectedConsultant);
      if (!consultant) {
        setError("Selected consultant not found");
        return;
      }

      if (consultant.role !== 'consultant') {
        setError("Selected user is not a consultant");
        return;
      }

      const response = await axios.put(
        `http://localhost:5001/api/students/${selectedStudent._id}/assign-consultant`,
        { consultantId: selectedConsultant },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data && response.data.success) {
        setSuccess("Consultant assigned successfully");
        setAssignConsultantOpen(false);
        setSelectedConsultant(''); // Reset selection
        
        // Refresh both students and consultants lists
        await Promise.all([
          fetchStudents(),
          fetchConsultants()
        ]);
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // If we get here, the assignment worked but population failed
        setSuccess("Consultant assigned successfully (refreshing data...)");
        setAssignConsultantOpen(false);
        setSelectedConsultant('');
        
        // Refresh both lists
        await Promise.all([
          fetchStudents(),
          fetchConsultants()
        ]);
        
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Error assigning consultant:", err);
      if (err.response) {
        // If we get a 500 error but the assignment actually worked
        if (err.response.status === 500) {
          setSuccess("Consultant assigned successfully (refreshing data...)");
          setAssignConsultantOpen(false);
          setSelectedConsultant('');
          
          // Refresh both lists
          await Promise.all([
            fetchStudents(),
            fetchConsultants()
          ]);
          
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(err.response.data?.message || `Error assigning consultant: ${err.response.status}`);
        }
      } else {
        setError("Failed to assign consultant. Please try again later.");
      }
    }
  };

  const handleUnassignConsultant = async (studentId) => {
    try {
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      console.log('Unassigning consultant for student:', studentId);

      const response = await axios.put(
        `http://localhost:5001/api/students/${studentId}/unassign-consultant`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data && response.data.success) {
        setSuccess("Consultant unassigned successfully");
        
        // Refresh both students and consultants lists
        await Promise.all([
          fetchStudents(),
          fetchConsultants()
        ]);
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // If we get here, the unassignment worked but population failed
        setSuccess("Consultant unassigned successfully (refreshing data...)");
        
        // Refresh both lists
        await Promise.all([
          fetchStudents(),
          fetchConsultants()
        ]);
        
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Error unassigning consultant:", err);
      if (err.response) {
        // If we get a 500 error but the unassignment actually worked
        if (err.response.status === 500) {
          setSuccess("Consultant unassigned successfully (refreshing data...)");
          
          // Refresh both lists
          await Promise.all([
            fetchStudents(),
            fetchConsultants()
          ]);
          
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(err.response.data?.message || `Error unassigning consultant: ${err.response.status}`);
        }
      } else {
        setError("Failed to unassign consultant. Please try again later.");
      }
    }
  };

  const handleViewProfile = (studentId) => {
    navigate(`/admin/student/${studentId}`);
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
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        All Registered Students
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Assigned Consultant</strong></TableCell>
              <TableCell><strong>Registration Date</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>
                  {student.firstName} {student.lastName}
                </TableCell>
                <TableCell>
                  <Chip
                    label={student.applicationStatus || 'Not Applied'}
                    color={
                      student.applicationStatus === 'Applied' ? 'success' :
                      student.applicationStatus === 'Rejected' ? 'error' :
                      student.applicationStatus === 'Unapplied' ? 'default' :
                      student.applicationStatus === 'In Progress' ? 'primary' :
                      student.applicationStatus === 'Complete' ? 'success' :
                      student.applicationStatus === 'Incomplete' ? 'warning' :
                      'default'
                    }
                    variant={student.applicationStatus === 'Unapplied' ? 'outlined' : 'filled'}
                    sx={{ fontWeight: 'bold', fontSize: '1rem', px: 2, py: 1 }}
                  />
                </TableCell>
                <TableCell>{student.phone || 'N/A'}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  {student.assignedConsultant ? 
                    `${student.assignedConsultant.profile?.firstName} ${student.assignedConsultant.profile?.lastName}` : 
                    'Not Assigned'}
                </TableCell>
                <TableCell>
                  {new Date(student.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      onClick={() => handleViewProfile(student._id)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="info"
                      onClick={() => {
                        setSelectedStudent(student);
                        handleOpenViewDocs();
                      }}
                    >
                      View Docs
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      onClick={() => {
                        setSelectedStudent(student);
                        handleOpenEdit();
                      }}
                    >
                      Edit
                    </Button>
                    {student.assignedConsultant ? (
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => handleUnassignConsultant(student._id)}
                      >
                        Unassign
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => {
                          setSelectedStudent(student);
                          setAssignConsultantOpen(true);
                        }}
                      >
                        Assign
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {selectedStudent && (
        <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#4CAF50", fontWeight: "bold" }}>
            Student Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Email:</strong> {selectedStudent.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Phone:</strong> {selectedStudent.phone || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Nationality:</strong> {selectedStudent.nationality || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Residence Country:</strong> {selectedStudent.residenceCountry || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Education Level:</strong> {selectedStudent.educationLevel || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Completion Year:</strong> {selectedStudent.completionYear || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Education Country:</strong> {selectedStudent.educationCountry || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Obtained Marks/CGPA:</strong> {selectedStudent.obtainedMarksAndCgpa || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Total Marks/CGPA:</strong> {selectedStudent.totalMarksAndCgpa || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                <strong>Assigned Consultant:</strong>{" "}
                {selectedStudent.assignedConsultant ? 
                  `${selectedStudent.assignedConsultant.profile?.firstName} ${selectedStudent.assignedConsultant.profile?.lastName}` : 
                  "Not Assigned"}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              sx={buttonStyles}
              onClick={handleOpenViewDocs}
            >
              View Documents
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenEdit}
              sx={buttonStyles}
            >
              Edit Details
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Replace the old View Documents Modal with the new component */}
      <AdminStudentDocuments
        open={viewDocsOpen}
        onClose={() => setViewDocsOpen(false)}
        documents={documents}
        loading={documentsLoading}
        studentName={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''}
      />

      {/* Edit Modal */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4CAF50" }}>
            Edit Student Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editData.firstName || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editData.lastName || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editData.email || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editData.phone || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nationality"
                  name="nationality"
                  value={editData.nationality || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Residence Country"
                  name="residenceCountry"
                  value={editData.residenceCountry || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Education Level"
                  name="educationLevel"
                  value={editData.educationLevel || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Completion Year"
                  name="completionYear"
                  value={editData.completionYear || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Education Country"
                  name="educationCountry"
                  value={editData.educationCountry || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Obtained Marks/CGPA"
                  name="obtainedMarksAndCgpa"
                  value={editData.obtainedMarksAndCgpa || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Marks/CGPA"
                  name="totalMarksAndCgpa"
                  value={editData.totalMarksAndCgpa || ""}
                  onChange={handleEditChange}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditOpen(false)} 
            variant="outlined"
            sx={cancelButtonStyles}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            sx={buttonStyles}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Consultant Modal */}
      <Dialog
        open={assignConsultantOpen}
        onClose={() => setAssignConsultantOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4CAF50" }}>
            Assign Consultant
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: "#4CAF50" }}>
                  Student Information
                </Typography>
                <Paper elevation={1} sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {selectedStudent?.firstName} {selectedStudent?.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {selectedStudent?.email}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, color: "#4CAF50" }}>
                  Select Consultant
                </Typography>
                <FormControl fullWidth sx={selectStyles}>
                  <InputLabel>Consultant</InputLabel>
                  <Select
                    value={selectedConsultant}
                    onChange={(e) => setSelectedConsultant(e.target.value)}
                    label="Consultant"
                  >
                    {consultants.map((consultant) => (
                      <MenuItem key={consultant._id} value={consultant._id}>
                        {consultant.profile?.firstName} {consultant.profile?.lastName} - {consultant.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAssignConsultantOpen(false)} 
            variant="outlined"
            sx={cancelButtonStyles}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignConsultant} 
            variant="contained"
            sx={buttonStyles}
          >
            Assign Consultant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllStudents;
