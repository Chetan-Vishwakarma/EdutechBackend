import mongoose from "mongoose";

const connectDB = async (DATABASE) => {
    await mongoose.connect(`${DATABASE}`)
    console.log("Database connected successfully");
}

export default connectDB;