const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/universityDB", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,  // Prevent timeout errors
            socketTimeoutMS: 45000  // Keeps MongoDB connection alive
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

// Ensure connection remains open
mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB Error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected! Reconnecting...");
    connectDB();
});

module.exports = connectDB;
