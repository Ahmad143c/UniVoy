const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Get all consultants (admin only)
router.get('/', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    const consultants = await User.find({ role: 'consultant' }).select('-password');
    res.json(consultants);
  } catch (error) {
    console.error('Error fetching consultants:', error);
    res.status(500).json({ message: 'Error fetching consultants', error: error.message });
  }
});

// Create new consultant (admin only)
router.post('/', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    console.log('Received request to create consultant:', req.body);
    console.log('User making request:', req.user);

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      specialization,
      experience
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new consultant
    const consultant = new User({
      username: `${firstName} ${lastName}`,
      email,
      password,
      role: 'consultant',
      profile: {
        firstName,
        lastName,
        phone,
        specialization,
        experience,
        assignedStudents: []
      }
    });

    await consultant.save();
    console.log('Consultant created successfully:', consultant._id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: consultant._id,
        role: consultant.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: consultant._id,
        username: consultant.username,
        email: consultant.email,
        role: consultant.role,
        profile: consultant.profile
      }
    });
  } catch (error) {
    console.error('Error creating consultant:', error);
    res.status(500).json({ message: 'Error creating consultant', error: error.message });
  }
});

// Remove consultant (admin only)
router.delete('/:id', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    console.log('Attempting to remove consultant with ID:', req.params.id);
    
    const consultant = await User.findById(req.params.id);
    
    if (!consultant) {
      console.log('Consultant not found');
      return res.status(404).json({ message: 'Consultant not found' });
    }

    if (consultant.role !== 'consultant') {
      console.log('User is not a consultant');
      return res.status(400).json({ message: 'User is not a consultant' });
    }

    // Update any students assigned to this consultant
    console.log('Updating assigned students');
    await User.updateMany(
      { 'profile.assignedConsultant': consultant._id },
      { 
        $set: { 
          'profile.assignedConsultant': null,
          'profile.applicationStatus': 'Pending'
        }
      }
    );

    // Delete all payments for this consultant
    const Payment = require('../models/Payment');
    const deletedPayments = await Payment.deleteMany({ user: consultant._id });
    console.log(`Deleted ${deletedPayments.deletedCount} payments for consultant`);

    // Remove the consultant using findByIdAndDelete
    console.log('Removing consultant');
    await User.findByIdAndDelete(req.params.id);

    console.log('Consultant removed successfully');
    res.json({ message: 'Consultant removed successfully' });
  } catch (error) {
    console.error('Error in delete route:', error);
    res.status(500).json({ 
      message: 'Error removing consultant', 
      error: error.message,
      details: error.stack 
    });
  }
});

// Update consultant (admin only)
router.put('/:id', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      specialization,
      experience
    } = req.body;

    const consultant = await User.findById(req.params.id);
    
    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    if (consultant.role !== 'consultant') {
      return res.status(400).json({ message: 'User is not a consultant' });
    }

    // Update consultant profile
    consultant.username = `${firstName} ${lastName}`;
    consultant.profile = {
      ...consultant.profile,
      firstName,
      lastName,
      phone,
      specialization,
      experience
    };

    await consultant.save();

    res.json({
      message: 'Consultant updated successfully',
      consultant: {
        id: consultant._id,
        username: consultant.username,
        email: consultant.email,
        role: consultant.role,
        profile: consultant.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating consultant', error: error.message });
  }
});

// Get assigned students for a consultant
router.get('/:id/assigned-students', auth, async (req, res) => {
  try {
    console.log('Fetching assigned students for consultant:', req.params.id);
    
    const consultant = await User.findById(req.params.id);
    
    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    if (consultant.role !== 'consultant') {
      return res.status(400).json({ message: 'User is not a consultant' });
    }

    // Get assigned students from the Student model
    const Student = require('../models/Student');
    const assignedStudents = await Student.find({ 
      assignedConsultant: consultant._id 
    })
    .populate({
      path: 'user',
      select: 'username email role',
      model: 'User'
    })
    .sort({ consultantAssignedAt: -1 });

    console.log('Found assigned students:', assignedStudents.length);

    // Transform the data to include user information
    const transformedStudents = assignedStudents.map(student => {
      const studentObj = student.toObject();
      return {
        _id: studentObj._id,
        user: studentObj.user, // Add the user field
        name: `${studentObj.firstName || ''} ${studentObj.lastName || ''}`.trim() || studentObj.user?.username || 'Unknown',
        email: studentObj.email || studentObj.user?.email,
        phone: studentObj.phone,
        nationality: studentObj.nationality,
        educationLevel: studentObj.educationLevel,
        preferredCountries: studentObj.preferredCountries,
        preferredUniversities: studentObj.preferredUniversities,
        applicationStatus: studentObj.applicationStatus || 'Not Applied',
        documentStatus: studentObj.documentStatus || 'Not Reviewed',
        assignedDate: studentObj.consultantAssignedAt || studentObj.createdAt,
        documents: studentObj.documents || {},
        profile: {
          ...studentObj,
          applicationStatus: studentObj.applicationStatus || 'Not Applied',
          documentStatus: studentObj.documentStatus || 'Not Reviewed'
        }
      };
    });

    res.json(transformedStudents);
  } catch (error) {
    console.error('Error fetching assigned students:', error);
    res.status(500).json({ 
      message: 'Error fetching assigned students', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get a specific student assigned to a consultant
router.get('/:consultantId/students/:studentId', auth, async (req, res) => {
  try {
    const { consultantId, studentId } = req.params;
    
    // Verify consultant exists and is authorized
    const consultant = await User.findById(consultantId);
    if (!consultant || consultant.role !== 'consultant') {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    // Get student and verify they are assigned to this consultant
    const Student = require('../models/Student');
    const student = await Student.findOne({
      _id: studentId,
      assignedConsultant: consultantId
    }).populate({
      path: 'user',
      select: 'username email role',
      model: 'User'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or not assigned to this consultant' });
    }

    // Transform the data to include user information
    const studentObj = student.toObject();
    const transformedStudent = {
      _id: studentObj._id,
      firstName: studentObj.firstName,
      lastName: studentObj.lastName,
      name: `${studentObj.firstName || ''} ${studentObj.lastName || ''}`.trim() || studentObj.user?.username || 'Unknown',
      email: studentObj.email || studentObj.user?.email,
      phone: studentObj.phone,
      nationality: studentObj.nationality,
      residenceCountry: studentObj.residenceCountry,
      educationLevel: studentObj.educationLevel,
      completionYear: studentObj.completionYear,
      educationCountry: studentObj.educationCountry,
      obtainedMarksAndCgpa: studentObj.obtainedMarksAndCgpa,
      totalMarksAndCgpa: studentObj.totalMarksAndCgpa,
      preferredCountries: studentObj.preferredCountries,
      preferredUniversities: studentObj.preferredUniversities,
      applicationStatus: studentObj.applicationStatus || 'Not Applied',
      documentStatus: studentObj.documentStatus || 'Not Reviewed',
      assignedDate: studentObj.consultantAssignedAt || studentObj.createdAt,
      consultantAssignedAt: studentObj.consultantAssignedAt,
      createdAt: studentObj.createdAt,
      documents: studentObj.documents || {},
      profilePicture: studentObj.profilePicture,
      user: studentObj.user
    };

    res.json(transformedStudent);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
});

// Download student document
router.get('/:consultantId/students/:studentId/documents/:documentType', auth, async (req, res) => {
  try {
    const { consultantId, studentId, documentType } = req.params;
    
    // Verify consultant exists and is authorized
    const consultant = await User.findById(consultantId);
    if (!consultant || consultant.role !== 'consultant') {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    // Get student and verify they are assigned to this consultant
    const Student = require('../models/Student');
    const student = await Student.findOne({
      _id: studentId,
      assignedConsultant: consultantId
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or not assigned to this consultant' });
    }

    // Check if document exists
    const document = student.documents[documentType];
    if (!document || !document.url) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get file path from URL
    const filePath = document.url.replace('http://localhost:5001/', '');
    const fullPath = require('path').join(__dirname, '..', filePath);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Send file
    res.download(fullPath, document.name || `${documentType}_${student.firstName}_${student.lastName}`);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Error downloading document', error: error.message });
  }
});

// Update student application status
router.put('/:consultantId/students/:studentId/status', auth, async (req, res) => {
  try {
    const { consultantId, studentId } = req.params;
    const { applicationStatus } = req.body;
    
    // Verify consultant exists and is authorized
    const consultant = await User.findById(consultantId);
    if (!consultant || consultant.role !== 'consultant') {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    // Get student and verify they are assigned to this consultant
    const Student = require('../models/Student');
    const student = await Student.findOne({
      _id: studentId,
      assignedConsultant: consultantId
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or not assigned to this consultant' });
    }

    // Update application status
    student.applicationStatus = applicationStatus;
    
    // Set applicationSubmittedAt when status is changed to 'Applied'
    if (applicationStatus === 'Applied' && !student.applicationSubmittedAt) {
      student.applicationSubmittedAt = new Date();
    }
    
    await student.save();

    res.json({ 
      message: 'Application status updated successfully',
      applicationStatus: student.applicationStatus
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status', error: error.message });
  }
});

module.exports = router; 