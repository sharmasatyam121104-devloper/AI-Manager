import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        require: true,
        unique: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    profilePicture: {
        type: String,
        default: null
    }
},
{timestamps: true})

const UserModel = mongoose.model("User", userSchema)

export default UserModel;