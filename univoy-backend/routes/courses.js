const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// @route   GET api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/courses/search
// @desc    Search courses
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query, intake, destination } = req.query;
    let searchQuery = {};

    if (query) {
      searchQuery.title = { $regex: query, $options: 'i' };
    }
    if (intake) {
      searchQuery.intake = { $regex: intake, $options: 'i' };
    }
    if (destination) {
      searchQuery.location = { $regex: destination, $options: 'i' };
    }

    const courses = await Course.find(searchQuery);
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/courses
// @desc    Add a new course
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 