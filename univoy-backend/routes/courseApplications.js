const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CourseApplication = require('../models/CourseApplication');
const User = require('../models/User');
const Student = require('../models/Student');

// @route   POST api/course-applications
// @desc    Create a new course application
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, universityData } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    if (!universityData) {
      return res.status(400).json({ message: 'University data is required' });
    }

    // Check if user already applied for this course
    const existingApplication = await CourseApplication.findOne({
      user: req.user.id,
      courseId: courseId.toString()
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this course' });
    }

    const application = new CourseApplication({
      user: req.user.id,
      courseId: courseId.toString(),
      universityData: {
        name: universityData.name,
        title: universityData.title,
        location: universityData.location,
        tuition_fee: universityData.tuition_fee,
        intake: universityData.intake,
        duration: universityData.duration,
        image: universityData.image
      }
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating course application:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET api/course-applications
// @desc    Get all applications for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const applications = await CourseApplication.find({ user: req.user.id });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/course-applications/student/:userId
// @desc    Get all applications for a specific student (admin only)
// @access  Private (Admin only)
router.get('/student/:userId', auth, async (req, res) => {
  try {
    console.log('Request received for student applications:', req.params.userId);
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (currentUser.role === 'admin') {
      const applications = await CourseApplication.find({ user: req.params.userId });
      console.log('Found applications:', applications.length);
      return res.json(applications);
    }
    if (currentUser.role === 'consultant') {
      // Check if the student is assigned to this consultant
      const Student = require('../models/Student');
      const student = await Student.findOne({ user: req.params.userId, assignedConsultant: currentUser._id });
      if (!student) {
        return res.status(403).json({ message: 'Access denied. Not assigned to this student.' });
      }
      const applications = await CourseApplication.find({ user: req.params.userId });
      return res.json(applications);
    }
    return res.status(403).json({ message: 'Access denied.' });
  } catch (error) {
    console.error('Error in /student/:userId route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to normalize status values
const normalizeStatus = (status) => {
  const statusMap = {
    'Submitted': 'submitted',
    'In Review': 'in review',
    'Accepted': 'accepted',
    'Rejected': 'rejected',
    'Approved': 'approved',
    'Complete': 'complete',
    'Incomplete': 'incomplete',
    'Pending': 'pending'
  };
  return statusMap[status] || status.toLowerCase();
};

// @route   PATCH api/course-applications/:id/status
// @desc    Update the status of a course application
// @access  Private (Admin or assigned consultant)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('=== STATUS UPDATE REQUEST ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.role);
    console.log('Application ID:', id);
    console.log('Original status:', status);
    
    if (!status) {
      console.log('Status is missing');
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Normalize the status value
    const normalizedStatus = normalizeStatus(status);
    console.log('Normalized status:', normalizedStatus);
    
    console.log('Looking for application with ID:', id);
    const application = await CourseApplication.findById(id);
    console.log('Application found:', application ? 'Yes' : 'No');
    
    if (!application) {
      console.log('Application not found');
      return res.status(404).json({ message: 'Application not found' });
    }
    
    console.log('Application details:', {
      id: application._id,
      user: application.user,
      status: application.status
    });
    
    // Only admin or assigned consultant can update
    console.log('Looking for current user with ID:', req.user.id);
    const currentUser = await User.findById(req.user.id);
    console.log('Current user found:', currentUser ? 'Yes' : 'No');
    
    if (!currentUser) {
      console.log('Current user not found');
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    console.log('Current user role:', currentUser.role);
    
    if (currentUser.role !== 'admin') {
      console.log('User is not admin, checking consultant assignment');
      // If consultant, check if assigned to this student
      console.log('Looking for student with user ID:', application.user);
      console.log('And assigned consultant:', currentUser._id);
      
      const student = await Student.findOne({ 
        user: application.user, 
        assignedConsultant: currentUser._id 
      });
      
      console.log('Student found:', student ? 'Yes' : 'No');
      
      if (!student) {
        console.log('Student not assigned to this consultant');
        return res.status(403).json({ message: 'Access denied. Not assigned to this student.' });
      }
    }
    
    console.log('Updating application status from', application.status, 'to', normalizedStatus);
    application.status = normalizedStatus;
    await application.save();
    
    console.log('Application status updated successfully');
    res.json({ success: true, application });
  } catch (error) {
    console.error('=== ERROR UPDATING APPLICATION STATUS ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error updating application status', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   GET api/course-applications/:courseId
// @desc    Check if user has applied for a specific course
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
  try {
    const application = await CourseApplication.findOne({
      user: req.user.id,
      courseId: req.params.courseId
    });
    res.json({ hasApplied: !!application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 