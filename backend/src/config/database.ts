import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-environment', {
      // MongoDB connection options
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('Server will continue without database connection. Some features may not work.');
    // Don't exit the process, let the server run without DB for development
  }
};

export default connectDB; 