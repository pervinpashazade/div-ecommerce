import Joi from "joi";
import { error } from "../consts.js";
import { subscribeModel } from "../models/subscribe.model.js";
import moment from "moment/moment.js";

import { sendEmailMessage } from "../Utility/email.sent.js";

const subscribeEmail = async (req, res) => {
  try {
    const validEmail = await Joi.object({
      email: Joi.string().email().trim().required(),
    }).validateAsync(req.body);

    const existEmail = await subscribeModel.findOne({
      email: validEmail.email,
    });

    if (existEmail) {
      return res.status(400).json("Email already exists");
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    const isExpired = moment().add(1, "minute").toDate();
    const emailMessage = await sendEmailMessage(validEmail.email, code,isExpired);
    if (!emailMessage) {
      return res.status(500).json({
        message: error[500],
      });
    }

    const newSubscription = new subscribeModel({
      email: validEmail.email,
      verifyCode: code,
      isexpiredAt: isExpired,
    });
    await newSubscription.save();

    return res.status(201).json({
      message: "Verification code gonderildi",
    });
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({
        message: error[422],
        errors: err.details.map((item) => item.message),
      });
    }

    return res.status(500).json({
      message: error[500],
      error: err.message,
    });
  }
};
const subscribeVerify = async (req, res) => {
  try {
    const validEmail = await Joi.object({
      code: Joi.string().length(6).pattern(/^\d+$/).required(),
    }).validateAsync(req.body);

  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({
        message: error[422],
        errors: err.details.map((item) => item.message),
      });
    }

    return res.status(500).json({
      message: error[500],
      error: err.message,
    });
  }
};

export const emailController = () => {
  return { subscribeEmail, subscribeVerify };
};
