const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb+srv://mohamed:12345@cluster0.i6rkc5n.mongodb.net/Voltiq?retryWrites=true&w=majority";
    console.log("Mongo URI:", mongoUri); // 👈 Add this

    console.log("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB is connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
  }
};

module.exports = connectDB;
