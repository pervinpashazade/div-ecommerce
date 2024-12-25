import mongoose from "mongoose";

const subscribeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isVerify: {
    type: Boolean,
    default: false,
  },
  verifyCode: {
    type: Number,
    required: true,
  },
  isexpiredAt: {
    type: Date,
    default: Date.now(),
  },
});

export const subscribeModel = mongoose.model("Subscribe", subscribeSchema);
