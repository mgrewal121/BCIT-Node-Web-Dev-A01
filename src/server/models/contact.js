const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  postedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false,
    required: true
  }
}, {
  timestamps: true
});

// Index for sorting
contactSchema.index({ postedDate: -1 });

module.exports = mongoose.model('Contact', contactSchema);