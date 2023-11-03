import mongoose from "mongoose";

const connectMongoDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Established connection!");
    } catch (error) {
        console.log("Error: ", error.message);
    }
}

export default connectMongoDB;