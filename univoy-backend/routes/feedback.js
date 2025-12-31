const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received feedback submission:', req.body);
    
    const { studentId, studentName, studentEmail, rating, feedback } = req.body;

    // Validate required fields
    if (!studentId || !studentName || !studentEmail || !rating || !feedback) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      studentId,
      studentName,
      studentEmail,
      rating,
      feedback: feedback.trim()
    });

    const savedFeedback = await newFeedback.save();
    console.log('Feedback saved successfully:', savedFeedback);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: savedFeedback
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      message: 'Server error while submitting feedback' 
    });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback (admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching all feedback');
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin only.' 
      });
    }

    const feedback = await Feedback.find()
      .sort({ submittedAt: -1 })
      .limit(100); // Limit to prevent overwhelming response

    console.log(`Found ${feedback.length} feedback entries`);

    res.json({
      feedback,
      count: feedback.length
    });

  } catch (error) {
    console.error('Error fetching all feedback:', error);
    res.status(500).json({ 
      message: 'Server error while fetching feedback' 
    });
  }
});

// @route   GET /api/feedback/student/:studentId
// @desc    Get feedback for a specific student
// @access  Private
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    console.log('Fetching feedback for student:', req.params.studentId);
    
    const { studentId } = req.params;

    // Check if user is admin or the student themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ 
        message: 'Access denied.' 
      });
    }

    const feedback = await Feedback.find({ studentId })
      .sort({ submittedAt: -1 });

    console.log(`Found ${feedback.length} feedback entries for student`);

    res.json({
      feedback,
      count: feedback.length
    });

  } catch (error) {
    console.error('Error fetching student feedback:', error);
    res.status(500).json({ 
      message: 'Server error while fetching student feedback' 
    });
  }
});

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics (admin only)
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('Fetching feedback statistics');
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin only.' 
      });
    }

    const totalFeedback = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const recentFeedback = await Feedback.find()
      .sort({ submittedAt: -1 })
      .limit(5);

    const stats = {
      totalFeedback,
      averageRating: averageRating.length > 0 ? Math.round(averageRating[0].averageRating * 10) / 10 : 0,
      ratingDistribution,
      recentFeedback
    };

    console.log('Feedback stats:', stats);

    res.json(stats);

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ 
      message: 'Server error while fetching feedback statistics' 
    });
  }
});

module.exports = router; 