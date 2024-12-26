import mongoose from "mongoose";

const subscribeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  isVerifiedEmail: {
    type: Boolean,
    default: false,
  },
  verifyExpiredIn: {
    type: Date,
    default: null,
  },
  token: {
    type: String,
    default: null,
  },

},{timestamps:true});

export const Subscribe = mongoose.model("Subscribe", subscribeSchema);