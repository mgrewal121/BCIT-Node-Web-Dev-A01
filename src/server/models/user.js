const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  nickname: {
    type: String,
    required: [true, 'Nickname is required'],
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['USER', 'MODERATOR', 'ADMIN'],
    default: 'USER',
    required: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

/**
 * Hash password before saving
 */
userSchema.pre('save', async function() {
  // Only hash if password is modified or new
  if (!this.isModified('passwordHash')) {
    return;
  }
  
  // Check if password is already hashed (starts with $2b$ or $2a$)
  if (this.passwordHash && this.passwordHash.startsWith('$2')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

/**
 * Method to compare password
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Don't return password in JSON
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);