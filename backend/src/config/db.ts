import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const conn = await mongoose.connect(process.env.MONGODB_URI!);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
