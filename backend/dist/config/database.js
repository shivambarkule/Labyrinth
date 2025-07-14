"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam-environment', {
            // MongoDB connection options
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        console.log('Server will continue without database connection. Some features may not work.');
        // Don't exit the process, let the server run without DB for development
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map