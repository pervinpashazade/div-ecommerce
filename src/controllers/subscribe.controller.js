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

    const token = uuidv4();

    const verifyExpiredIn = moment().add(appConfig.MINUTE, "minutes");const verifyUrl = `${appConfig.VERIFY_URL}${token}`;

    const mailOptions = {
      from: appConfig.EMAIL,
      to: email,
      subject: "Verify Email",
      html: `<h3>Verify Email</h3>
                   <p>To verify your email, click the link below:</p>
                   <a href="${verifyUrl}">Verify Email</a>
                   <p>This link is valid for ${appConfig.MINUTE} minute.</p>`,
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
    })

    if (subscribe) {
      subscribe.verifyExpiredIn = verifyExpiredIn;
      subscribe.token = token;
      res.json(subscribe);
      return subscribe.save();
    }

    await Subscribe.create({
      email,
      verifyExpiredIn,
      token,
    })
      .then((newSubscribe) => res.status(201).json(newSubscribe))
      .catch((error) =>
        res.status(500).json({
          message: "Xeta bash verdi!",
          error,
        })
      );
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};

const checkVerifyCode = async (req, res) => {
  try {
    if (!req.params.token) return res.json("Token is required");

    const subscribe = await Subscribe.findOne({
      token: req.params.token,
    });

    if (!subscribe) return res.json("Bu tokene uygun mail yoxdur");

    const user = await User.findOne({ email: subscribe.email });

    if (subscribe.isVerifiedEmail === true) {
      return res.json("Siz artiq verified olmusunuz");
    }

    if (subscribe.verifyExpiredIn < Date.now()) {
      return res.status(400).json("artıq vaxt bitib, yenidən cəhd edin");
    }

    await Subscribe.updateMany(
      { email: subscribe.email },
      { isVerifiedEmail: true, verifyExpiredIn: null }
    );

    if (user) {
      user.isVerifiedEmail = true;
      await user.save();
    }

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
