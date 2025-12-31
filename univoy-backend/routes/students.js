const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');

const calculateProfileCompletion = (student) => {
  const requiredFields = {
    personal: [
      'firstName',
      'lastName',
      'email',
      'phone',
      'nationality',
      'residenceCountry'
    ],
    academic: [
      'educationLevel',
      'completionYear',
      'educationCountry',
      'obtainedMarksAndCgpa',
      'totalMarksAndCgpa'
    ],
    documents: [
      'transcript',
      'passport',
      'englishTest',
      'resume',
      'referenceletter',
      'experienceletter'
    ]
  };

  let totalFields = 0;
  let completedFields = 0;

  // Check personal information
  requiredFields.personal.forEach(field => {
    totalFields++;
    if (student[field]) completedFields++;
  });

  // Check academic information
  requiredFields.academic.forEach(field => {
    totalFields++;
    if (student[field]) completedFields++;
  });

  // Check documents
  requiredFields.documents.forEach(field => {
    totalFields++;
    if (student.documents && student.documents[field]) completedFields++;
  });

  // Calculate percentage
  return Math.round((completedFields / totalFields) * 100);
};

// @route   GET api/students/profile
// @desc    Get student profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }
    
    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(student);
    
    // Add completion percentage to response
    const studentWithCompletion = {
      ...student.toObject(),
      profileCompletion
    };
    
    res.json(studentWithCompletion);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/students/profile
// @desc    Create or update student profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      nationality,
      residenceCountry,
      phone,
      email,
      educationLevel,
      completionYear,
      educationCountry,
      obtainedMarksAndCgpa,
      totalMarksAndCgpa,
      documents,
      profilePicture,
      preferredCountries
    } = req.body;

    // Build profile object
    const profileFields = {
      user: req.user.id,
      firstName,
      lastName,
      nationality,
      residenceCountry,
      phone,
      email,
      educationLevel,
      completionYear,
      educationCountry,
      obtainedMarksAndCgpa,
      totalMarksAndCgpa,
      documents: documents || {},
      profilePicture,
      preferredCountries: preferredCountries || []
    };

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'nationality',
      'residenceCountry',
      'phone',
      'email',
      'educationLevel',
      'completionYear',
      'educationCountry',
      'obtainedMarksAndCgpa',
      'totalMarksAndCgpa'
    ];

    const missingFields = requiredFields.filter(field => !profileFields[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }

    let student = await Student.findOne({ user: req.user.id });
    if (student) {
      // Update
      student = await Student.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
    } else {
      // Create
      student = new Student(profileFields);
      await student.save();
    }
    
    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(student);
    const studentWithCompletion = {
      ...student.toObject(),
      profileCompletion
    };
    
    res.json(studentWithCompletion);
  } catch (err) {
    console.error('Error updating profile:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      message: 'Error updating profile',
      error: err.message
    });
  }
});

// @route   PUT api/students/:studentId/unassign-consultant
// @desc    Unassign consultant from student
// @access  Private (Admin only)
router.put('/:studentId/unassign-consultant', auth, async (req, res) => {
  try {
    console.log('Unassign consultant request received:', {
      studentId: req.params.studentId,
      body: req.body
    });

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Store the old consultant ID for updating their assigned students
    const oldConsultantId = student.assignedConsultant;

    // Update student
    student.assignedConsultant = null;
    await student.save();

    // Update consultant's assigned students if there was a previous consultant
    if (oldConsultantId) {
      const consultant = await User.findById(oldConsultantId);
      if (consultant) {
        if (!consultant.profile) {
          consultant.profile = {};
        }
        if (!Array.isArray(consultant.profile.assignedStudents)) {
          consultant.profile.assignedStudents = [];
        }
        consultant.profile.assignedStudents = consultant.profile.assignedStudents.filter(
          id => id.toString() !== student._id.toString()
        );
        await consultant.save();
      } else {
        // Consultant not found, log and continue
        console.warn(`Consultant with ID ${oldConsultantId} not found while unassigning student ${student._id}`);
      }
    }

    // Try to populate the student data, but don't fail if it doesn't work
    try {
      const updatedStudent = await Student.findById(student._id)
        .populate('assignedConsultant', 'name email')
        .populate('assignedUniversity', 'name country')
        .populate('assignedCourse', 'name university');

      return res.json({
        success: true,
        message: 'Consultant unassigned successfully',
        student: updatedStudent
      });
    } catch (populateError) {
      console.error('Error populating student data:', populateError);
      // Still return success since the unassignment worked
      return res.json({
        success: true,
        message: 'Consultant unassigned successfully (data refresh needed)',
        student: student
      });
    }
  } catch (error) {
    console.error('Error in unassign-consultant:', error);
    res.status(500).json({ 
      message: 'Error unassigning consultant',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   PUT api/students/:id
// @desc    Update student details
// @access  Private (Admin only)
router.put('/:id', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    console.log('Update student request received:', {
      studentId: req.params.id,
      updateData: req.body
    });

    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Update allowed fields
    const allowedFields = [
      'firstName', 
      'lastName', 
      'email', 
      'phone', 
      'nationality', 
      'residenceCountry',
      'educationLevel', 
      'completionYear', 
      'educationCountry', 
      'obtainedMarksAndCgpa', 
      'totalMarksAndCgpa'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Update the student
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Student updated successfully');

    res.json({ 
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
});

// @route   PUT api/students/:id/assign-consultant
// @desc    Assign consultant to student
// @access  Private (Admin only)
router.put('/:id/assign-consultant', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    console.log('Assign consultant request received:', {
      studentId: req.params.id,
      consultantId: req.body.consultantId
    });

    if (!req.body.consultantId) {
      return res.status(400).json({ success: false, message: 'Consultant ID is required' });
    }

    const student = await Student.findById(req.params.id);
    console.log('Found student:', student ? 'yes' : 'no');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if new consultant exists and is actually a consultant
    console.log('Looking for new consultant');
    const consultant = await User.findOne({ 
      _id: req.body.consultantId,
      role: 'consultant'
    });
    
    console.log('Found new consultant:', consultant ? 'yes' : 'no');
    
    if (!consultant) {
      return res.status(404).json({ success: false, message: 'Consultant not found or is not a consultant' });
    }

    // If student already has a consultant, unassign them first
    if (student.assignedConsultant) {
      console.log('Student has existing consultant, unassigning first');
      const currentConsultant = await User.findById(student.assignedConsultant);
      if (currentConsultant) {
        console.log('Found current consultant, updating assigned students');
        // Remove student from current consultant's assigned students
        if (currentConsultant.profile && currentConsultant.profile.assignedStudents) {
          currentConsultant.profile.assignedStudents = currentConsultant.profile.assignedStudents.filter(
            id => id.toString() !== student._id.toString()
          );
          await currentConsultant.save();
          console.log('Updated current consultant profile');
        }
      }
    }

    // Update student's assigned consultant
    console.log('Updating student with new consultant');
    student.assignedConsultant = consultant._id;
    student.consultantAssignedAt = new Date();
    await student.save();
    console.log('Student updated successfully');

    // Update consultant's assigned students
    console.log('Updating consultant profile');
    if (!consultant.profile) {
      console.log('Creating new profile for consultant');
      consultant.profile = {};
    }
    if (!consultant.profile.assignedStudents) {
      console.log('Initializing assignedStudents array');
      consultant.profile.assignedStudents = [];
    }
    
    // Add student to consultant's assigned students if not already there
    if (!consultant.profile.assignedStudents.includes(student._id)) {
      console.log('Adding student to consultant assigned students');
      consultant.profile.assignedStudents.push(student._id);
      await consultant.save();
      console.log('Consultant profile updated successfully');
    }

    try {
      // Get updated student with populated fields
      console.log('Fetching updated student data');
      const updatedStudent = await Student.findById(req.params.id)
        .populate({
          path: 'user',
          select: 'username email role',
          model: 'User'
        })
        .populate({
          path: 'assignedConsultant',
          select: 'username email profile',
          model: 'User'
        });

      console.log('Assignment completed successfully');
      return res.json({
        success: true,
        message: 'Consultant assigned successfully',
        student: updatedStudent
      });
    } catch (populateError) {
      console.error('Error populating student data:', populateError);
      // Even if population fails, return success since the assignment worked
      return res.json({
        success: true,
        message: 'Consultant assigned successfully (some data may not be fully loaded)',
        student: student
      });
    }
  } catch (err) {
    console.error('Error assigning consultant:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      success: false,
      message: 'Error assigning consultant', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET api/students/:id/documents
// @desc    Get student's uploaded documents
// @access  Private (Admin only)
router.get('/:id/documents', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const documents = student.documents || {};
    res.json(documents);
  } catch (err) {
    console.error('Error fetching student documents:', err);
    res.status(500).json({ 
      message: 'Error fetching student documents', 
      error: err.message 
    });
  }
});

// Upload document
router.post('/documents', auth, async (req, res) => {
  try {
    const { documentType, documentUrl } = req.body;
    
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ msg: 'Student profile not found' });
    }

    student.documents[documentType] = documentUrl;
    await student.save();

    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/students/new
// @desc    Get new students (registered in last 7 days without consultant)
// @access  Private (Admin only)
router.get('/new', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newStudents = await Student.find({
      createdAt: { $gte: oneWeekAgo },
      assignedConsultant: null
    })
    .populate({
      path: 'user',
      select: 'username email role profile',
      model: 'users'
    })
    .sort({ createdAt: -1 });

    // Transform the data to include user information
    const transformedStudents = newStudents.map(student => {
      const studentObj = student.toObject();
      return {
        ...studentObj,
        username: studentObj.user?.username,
        email: studentObj.user?.email,
        role: studentObj.user?.role,
        firstName: studentObj.firstName,
        lastName: studentObj.lastName,
        phone: studentObj.phone
      };
    });

    res.json(transformedStudents);
  } catch (err) {
    console.error('Error fetching new students:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching new students', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET api/students
// @desc    Get all students
// @access  Private (Admin only)
router.get('/', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    console.log('Fetching all students. User:', req.user);
    
    const students = await Student.find()
      .populate({
        path: 'user',
        select: 'username email role',
        model: 'User'
      })
      .populate({
        path: 'assignedConsultant',
        select: 'username email profile',
        model: 'User'
      })
      .sort({ createdAt: -1 });
    
    console.log('Found students:', students.length);
    
    // Transform the data to include user information
    const transformedStudents = students.map(student => {
      const studentObj = student.toObject();
      console.log(`Student ${studentObj._id} documentStatus:`, studentObj.documentStatus);
      return {
        ...studentObj,
        username: studentObj.user?.username,
        email: studentObj.email,
        role: studentObj.user?.role,
        firstName: studentObj.firstName,
        lastName: studentObj.lastName,
        phone: studentObj.phone,
        applicationStatus: studentObj.applicationStatus || 'Not Applied',
        documentStatus: studentObj.documentStatus || 'Not Reviewed',
        assignedConsultantName: studentObj.assignedConsultant ? 
          `${studentObj.assignedConsultant.profile?.firstName || ''} ${studentObj.assignedConsultant.profile?.lastName || ''}` : 
          null
      };
    });

    res.json(transformedStudents);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching students', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET api/students/applied
// @desc    Get all students who have been applied by consultants (admin only)
// @access  Private/Admin
router.get('/applied', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    console.log('Fetching applied students. User:', req.user);
    
    const students = await Student.find({ 
      applicationStatus: 'Applied',
      assignedConsultant: { $exists: true, $ne: null }
    })
      .populate({
        path: 'user',
        select: 'username email role',
        model: 'User'
      })
      .populate({
        path: 'assignedConsultant',
        select: 'username email profile',
        model: 'User'
      })
      .sort({ applicationSubmittedAt: -1, createdAt: -1 });
    
    console.log('Found applied students:', students.length);
    
    // Transform the data to include user information
    const transformedStudents = students.map(student => {
      const studentObj = student.toObject();
      return {
        ...studentObj,
        username: studentObj.user?.username,
        email: studentObj.user?.email,
        role: studentObj.user?.role,
        applicationStatus: studentObj.applicationStatus || 'Not Applied',
        documentStatus: studentObj.documentStatus || 'Not Reviewed',
        assignedConsultantName: studentObj.assignedConsultant ? 
          `${studentObj.assignedConsultant.profile?.firstName || ''} ${studentObj.assignedConsultant.profile?.lastName || ''}` : 
          null
      };
    });

    res.json(transformedStudents);
  } catch (err) {
    console.error('Error fetching applied students:', err);
    res.status(500).json({ 
      message: 'Error fetching applied students', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   POST api/students/:id/university-documents
// @desc    Add a university document to a student (consultant or admin)
// @access  Private
router.post('/:id/university-documents', auth, async (req, res) => {
  try {
    const { name, url } = req.body;
    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required.' });
    }
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    // Only allow admin or assigned consultant
    if (
      req.user.role !== 'admin' &&
      (!student.assignedConsultant || student.assignedConsultant.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    student.universityDocuments.push({
      name,
      url,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    });
    await student.save();
    res.json({ success: true, universityDocuments: student.universityDocuments });
  } catch (err) {
    console.error('Error adding university document:', err);
    res.status(500).json({ message: 'Error adding university document', error: err.message });
  }
});

// @route   GET api/students/:id/university-documents
// @desc    Get all university documents for a student
// @access  Private (admin, assigned consultant, or the student themself)
router.get('/:id/university-documents', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('universityDocuments.uploadedBy', 'username email role profile');
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }
    // Only allow admin, assigned consultant, or the student themself
    if (
      req.user.role !== 'admin' &&
      (!student.assignedConsultant || student.assignedConsultant.toString() !== req.user.id) &&
      (!student.user || student.user.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    res.json({ universityDocuments: student.universityDocuments });
  } catch (err) {
    console.error('Error fetching university documents:', err);
    res.status(500).json({ message: 'Error fetching university documents', error: err.message });
  }
});

// @route   GET api/students/:id
// @desc    Get student by ID (admin only)
// @access  Private/Admin
router.get('/:id', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    console.log('Fetching student by ID:', req.params.id);
    console.log('User:', req.user);
    
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'username email role',
        model: 'User'
      })
      .populate({
        path: 'assignedConsultant',
        select: 'username email profile',
        model: 'User'
      });
    
    if (!student) {
      console.log('Student not found');
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Found student:', student._id);
    
    const studentObj = student.toObject();
    const transformedStudent = {
      ...studentObj,
      username: studentObj.user?.username,
      email: studentObj.user?.email,
      role: studentObj.user?.role,
      applicationStatus: studentObj.applicationStatus || 'Not Applied',
      documentStatus: studentObj.documentStatus || 'Not Reviewed',
      assignedConsultantName: studentObj.assignedConsultant ? 
        `${studentObj.assignedConsultant.profile?.firstName || ''} ${studentObj.assignedConsultant.profile?.lastName || ''}` : 
        null
    };

    res.json(transformedStudent);
  } catch (err) {
    console.error('Error fetching student:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).json({ 
      message: 'Error fetching student', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   DELETE api/students/:id
// @desc    Delete student by ID (admin only)
// @access  Private/Admin
router.delete('/:id', auth, auth.checkRole(['admin']), async (req, res) => {
  try {
    console.log('Deleting student with ID:', req.params.id);
    console.log('User:', req.user);
    
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      console.log('Student not found');
      return res.status(404).json({ message: 'Student not found' });
    }

    // Store the user ID and consultant ID for cleanup
    const userId = student.user;
    const consultantId = student.assignedConsultant;

    // If student has an assigned consultant, remove them from consultant's assigned students
    if (consultantId) {
      const consultant = await User.findById(consultantId);
      if (consultant && consultant.profile && consultant.profile.assignedStudents) {
        consultant.profile.assignedStudents = consultant.profile.assignedStudents.filter(
          id => id.toString() !== student._id.toString()
        );
        await consultant.save();
        console.log('Updated consultant assigned students');
      }
    }

    // Delete all course applications for this student's user
    if (userId) {
      const CourseApplication = require('../models/CourseApplication');
      const deletedApplications = await CourseApplication.deleteMany({ user: userId });
      console.log(`Deleted ${deletedApplications.deletedCount} course applications`);
      
      // Delete all payments for this user
      const Payment = require('../models/Payment');
      const deletedPayments = await Payment.deleteMany({ user: userId });
      console.log(`Deleted ${deletedPayments.deletedCount} payments`);
    }

    // Delete the student
    await Student.findByIdAndDelete(req.params.id);
    console.log('Student deleted successfully');

    // Note: We're not deleting the user account itself as it might be used for other purposes
    // If you want to delete the user account as well, uncomment the following lines:
    // if (userId) {
    //   await User.findByIdAndDelete(userId);
    //   console.log('User account deleted successfully');
    // }

    res.json({ 
      success: true,
      message: 'Student deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting student:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error deleting student', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   PUT api/students/:id/document-status
// @desc    Update student document status (admin or assigned consultant)
// @access  Private
router.put('/:id/document-status', auth, async (req, res) => {
  try {
    const { documentStatus } = req.body;
    const studentId = req.params.id;
    
    // Validate document status
    const validStatuses = ['Not Reviewed', 'Under Review', 'Complete', 'Incomplete', 'Approved', 'Rejected'];
    if (!validStatuses.includes(documentStatus)) {
      return res.status(400).json({ message: 'Invalid document status' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check authorization - only admin or assigned consultant can update
    if (req.user.role !== 'admin' && 
        (!student.assignedConsultant || student.assignedConsultant.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this student\'s document status' });
    }

    // Update document status
    console.log(`Updating document status for student ${studentId} from ${student.documentStatus} to ${documentStatus}`);
    student.documentStatus = documentStatus;
    await student.save();
    console.log(`Document status updated successfully. New status: ${student.documentStatus}`);

    res.json({ 
      success: true,
      message: 'Document status updated successfully',
      documentStatus: student.documentStatus
    });
  } catch (err) {
    console.error('Error updating document status:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error updating document status', 
      error: err.message 
    });
  }
});

module.exports = router; 