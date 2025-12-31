// Script to update all student document URLs from localhost:5000 to localhost:5001
const mongoose = require('mongoose');
const config = require('../config/default.json');
const Student = require('../models/Student');

const MONGO_URI = config.mongoURI || process.env.MONGO_URI;

async function updateDocumentUrls() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const students = await Student.find({});
    let updatedCount = 0;

    for (const student of students) {
      let updated = false;
      if (student.documents) {
        for (const [key, doc] of Object.entries(student.documents)) {
          if (doc && doc.url && typeof doc.url === 'string' && doc.url.includes('localhost:5000')) {
            student.documents[key].url = doc.url.replace('localhost:5000', 'localhost:5001');
            updated = true;
          }
        }
      }
      if (updated) {
        await student.save();
        updatedCount++;
        console.log(`Updated student ${student._id}`);
      }
    }

    console.log(`Done! Updated ${updatedCount} students.`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating document URLs:', err);
    process.exit(1);
  }
}

updateDocumentUrls(); 