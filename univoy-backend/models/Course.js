const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  legacyId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  institution: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  tuition_fee: {
    type: String,
    required: true
  },
  initial_required: {
    type: String
  },
  scholarship: {
    type: String
  },
  application_fee: {
    type: String
  },
  intake: {
    type: String,
    required: true
  },
  turnaround_time: {
    type: String
  },
  admission_requirements: {
    TOEFL: Number,
    PTE: Number,
    IELTS_UKVI: String
  },
  post_study_work_visa: {
    type: String,
    enum: ['Available', 'Not Available']
  },
  gap_year_allowed: {
    type: Boolean,
    default: false
  },
  backlog_allowed: {
    type: Boolean,
    default: false
  },
  is_drive_only: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Course', CourseSchema); 