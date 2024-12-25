import express from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { appConfig } from "../consts.js";
import { User } from "../models/user.model.js";
import { Subscribe } from "../models/subscribe.model.js";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: appConfig.EMAIL,
    pass: appConfig.EMAIL_PASSWORD,
  },
});

const verifyEmail = async (req, res, next) => {
  try {
    const { email } = await Joi.object({
      email: Joi.string().trim().email().required(),
    })
      .validateAsync(req.body)
      .catch((err) => {
        return res.status(422).json({
          message: "Xeta bash verdi!",
          error: err.details.map((item) => item.message),
        });
      });

    const subscribe = await Subscribe.findOne({ email });

    const user = await User.findOne({ email });

    if (user && user.isVerifiedEmail === true) {
      return res.json("Email is already verified, you can continue");
    }

    if (subscribe && subscribe.isVerifiedEmail === true) {
      return res.json("Email is already verified, you can continue");
    }

    const verifyCode = Math.floor(100000 + Math.random() * 600000);

    const verifyExpiredIn = moment().add(appConfig.MINUTE, "minutes");

    if (subscribe) {
      subscribe.verifyCode = verifyCode;
      subscribe.verifyExpiredIn = verifyExpiredIn;
      res.json(subscribe);
      return subscribe.save();
    }

    await Subscribe.create({
      email,
      verifyCode,
      verifyExpiredIn,
    })
      .then((newSubscribe) => res.status(201).json(newSubscribe))
      .catch((error) =>
        res.status(500).json({
          message: "Xeta bash verdi!",
          error,
        })
      );

    const mailOptions = {
      from: appConfig.EMAIL,
      to: email,
      subject: "Hello",
      text: `Please Verify your Email address ${verifyCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        return res.status(500).json({
          message: error.message,
          error,
        });
      } else {
        console.log("Email sent: ", info);
        return res.json({ message: "Check your email" });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};

const checkVerifyCode = async (req, res) => {
  try {
    const email = req.query.email;

    const { code } = await Joi.object({
      code: Joi.number().min(100000).max(999999).required(),
    }).validateAsync(req.body);

    const subscribe = await Subscribe.findOne({ email: email });

    if (!subscribe.verifyCode) {
      return res.status(400).json({
        message: "Verification code not found!",
      });
    }

    if (subscribe.verifyExpiredIn < Date.now()) {
      return res.status(400).json("artıq vaxt bitib, yenidən cəhd edin");
    }

    if (subscribe.verifyCode !== code) {
      return res.status(400).json("kod eyni deyil");
    }

    await Subscribe.updateMany(
      { email },
      { isVerifiedEmail: true, verifyCode: null, verifyExpiredIn: null }
    );
    // subscribe.isVerifiedEmail = true;
    // subscribe.verifyCode = null;
    // subscribe.verifyExpiredIn = null;
    // await subscribe.save();
    return res.json({
      message: "Email verified successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};

export const subscribeController = () => ({
  verifyEmail,
  checkVerifyCode,
});
