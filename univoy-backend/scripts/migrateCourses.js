const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');
require('dotenv').config();

const migrateCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Read the courses.json file
    const coursesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../univoy-frontend/public/data/courses.json'), 'utf8')
    );

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Transform the data to handle IDs correctly
    const transformedCourses = coursesData.map(course => {
      const { id, ...rest } = course;
      return {
        ...rest,
        legacyId: id.toString(), // Convert numeric ID to string and store as legacyId
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Insert new courses
    await Course.insertMany(transformedCourses);
    console.log('Successfully migrated courses to MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error migrating courses:', error);
    process.exit(1);
  }
};

migrateCourses(); 