/* CLAUD GENERATED FILE */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using Mongoose
 */
async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(uri);

    console.log('✓ MongoDB connected successfully');
    console.log('✓ Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    console.error('  Make sure your .env file exists and MONGODB_URI is correct');
    process.exit(1); // Exit the app if DB connection fails
  }
}

/**
 * Handle connection events
 */
mongoose.connection.on('disconnected', () => {
  console.log('✗ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('✗ MongoDB error:', err.message);
});

module.exports = { connectDB };