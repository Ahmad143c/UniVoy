const mongoose = require('mongoose');
const Student = require('../models/Student');
const config = require('config');

// Connect to MongoDB
const mongoURI = config.get('mongoURI');
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateStudentApplicationStatus = async () => {
  try {
    console.log('Starting migration to add applicationStatus field to existing students...');
    
    // Find all students that don't have applicationStatus field
    const studentsToUpdate = await Student.find({
      applicationStatus: { $exists: false }
    });
    
    console.log(`Found ${studentsToUpdate.length} students without applicationStatus field`);
    
    if (studentsToUpdate.length === 0) {
      console.log('No students need to be updated. Migration complete.');
      return;
    }
    
    // Update each student to have the default applicationStatus
    const updatePromises = studentsToUpdate.map(student => {
      return Student.findByIdAndUpdate(
        student._id,
        { 
          $set: { 
            applicationStatus: 'Not Applied' 
          } 
        },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    console.log(`Successfully updated ${studentsToUpdate.length} students with applicationStatus field`);
    console.log('Migration complete!');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the migration
updateStudentApplicationStatus(); 