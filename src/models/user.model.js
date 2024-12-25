import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerifiedEmail: {
      type: Boolean,
      default: null,
    },
    verifyCode: {
      type: Number,
      default: null,
    },
    verifyExpiredIn: {
      type: Date,
      default: null,
    },
    uuidToken: {
      type: String,
      default: null,
    },
    resetExpiredIn: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      required: true,
      default: "customer",
    },
    companyName: {
      type: String,
      required: false,
    },
    countryName: {
      type: String,
      required: false,
    },
    street: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    zipCode: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
