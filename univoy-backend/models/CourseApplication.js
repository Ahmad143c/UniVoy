const mongoose = require('mongoose');

const CourseApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  universityData: {
    name: String,
    title: String,
    location: String,
    tuition_fee: String,
    intake: String,
    duration: String,
    image: String
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'in review', 'approved', 'rejected', 'accepted', 'complete', 'incomplete'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  paymentCompleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('CourseApplication', CourseApplicationSchema); 