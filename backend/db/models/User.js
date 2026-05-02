import mongoose, { Schema } from "mongoose";


const UserSchema = new Schema({
    name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'member'], default: 'member' },
}, { timestamps: true });

const UserModel = mongoose.model("User", UserSchema)

export default UserModel;