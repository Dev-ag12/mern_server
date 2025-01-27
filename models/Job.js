const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  applicants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      appliedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  benefits: {
    type: [String],
    default: []
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  datePosted: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);
