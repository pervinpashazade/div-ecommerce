import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isVerifiedEmail: {
    type: Boolean,
    default: false,
  },
  verify_Code: {
    type: Number,
    default: null,
  },
  verifyExpiredIn: {
    type: Date,
    default: null,
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
});
export const Subscribe = mongoose.model("Subscribes", subscriberSchema);
