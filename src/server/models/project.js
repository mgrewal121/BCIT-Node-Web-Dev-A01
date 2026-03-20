const mongoose = require('mongoose');

// Tag schema 
const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false }); 

// Image schema
const imageSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  tagline: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  tags: {
    type: [tagSchema],
    default: []
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },

  stack: {
    type: [String],
    default: []
  },
  images: {
    type: [imageSchema],
    default: []
  },
  dates: {
    created: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    updated: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    }
  }
}, {
  timestamps: true
});

// Text index for searching
projectSchema.index({ 
  title: 'text', 
  description: 'text', 
  tagline: 'text' 
});

module.exports = mongoose.model('Project', projectSchema);