const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  url: String,
  name: String
});

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  residenceCountry: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  educationLevel: {
    type: String,
    required: true
  },
  completionYear: {
    type: String,
    required: true
  },
  educationCountry: {
    type: String,
    required: true
  },
  obtainedMarksAndCgpa: {
    type: String,
    required: true
  },
  totalMarksAndCgpa: {
    type: String,
    required: true
  },
  documents: {
    transcript: {
      url: String,
      uploadedAt: Date
    },
    passport: {
      url: String,
      uploadedAt: Date
    },
    englishTest: {
      url: String,
      uploadedAt: Date
    },
    resume: {
      url: String,
      uploadedAt: Date
    },
    referenceletter: {
      url: String,
      uploadedAt: Date
    },
    experienceletter: {
      url: String,
      uploadedAt: Date
    }
  },
  profilePicture: {
    type: String
  },
  assignedConsultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  consultantAssignedAt: {
    type: Date
  },
  applicationStatus: {
    type: String,
    enum: ['Not Applied', 'Applied', 'In Progress', 'Complete', 'Incomplete', 'Pending', 'Rejected', 'Unapplied'],
    default: 'Not Applied'
  },
  documentStatus: {
    type: String,
    enum: ['Not Reviewed', 'Under Review', 'Complete', 'Incomplete', 'Approved', 'Rejected'],
    default: 'Not Reviewed'
  },
  applicationSubmittedAt: {
    type: Date
  },
  universityDocuments: [
    {
      name: String,
      url: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  preferredCountries: {
    type: [String],
    default: []
  },
  preferredUniversities: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('student', StudentSchema); 