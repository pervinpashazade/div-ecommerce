import Joi from "joi"; // `exist` silindi, çünki istifadə olunmur
import { Subscribe } from "../models/subscriber.model.js";
import { appConfig } from "../consts.js";
import { sendMail } from "../utility/emailService.utils.js";
import { HelpersUtils } from "../utility/helpers.utils.js";

// Abunə olmaq funksiyası
const createSubscriber = async (req, res) => {
  try {
    // 1. req.body validasiyası
    const { email } = await Joi.object({
      email: Joi.string().trim().email().required(),
    }).validateAsync(req.body);

    // 2. Email bazada yoxlanılır
    const existsSubscriber = await Subscribe.findOne({ email });

    if (existsSubscriber && existsSubscriber.isVerifiedEmail === true) {
      return res.json({ message: "Email already subscribed" });
    }
    const helpers = HelpersUtils();
    const verificationCode = helpers.otp6; // 6 rəqəmli təsdiq kodu
    const verifyExpiredIn = helpers.generateExpiryDate;

    if (existsSubscriber && existsSubscriber.isVerifiedEmail === false) {
      existsSubscriber.verify_Code = verificationCode;
      existsSubscriber.verifyExpiredIn = verifyExpiredIn;
      await existsSubscriber.save();
    } else {
      const newSubscriber = await Subscribe.create({
        email,
        verify_Code: verificationCode,
        verifyExpiredIn: verifyExpiredIn,
      });
    }

    // 4. Email göndərilməsi
    const subject = "Verification code";
    const text = `Your verify code is ${verificationCode} .It will expire in ${appConfig.VERIFYEXPIREDIN} minutes`;
    await sendMail(req, res, email, subject, text);
  } catch (error) {
    console.error("Error occurred while subscribing:", error);
    return res.status(500).json({ message: "Failed to subscribe", error });
  }
};

// Təsdiq kodunu yoxlama funksiyası
const checkVerifyCode = async (req, res) => {
  try {
    // 1. req.body validasiyası
    const { email, code } = await Joi.object({
      email: Joi.string().trim().email().required(),
      code: Joi.string().length(6).regex(/^\d+$/).required(),
    }).validateAsync(req.body, { abortEarly: false });

    // 2. İstifadəçinin bazada yoxlanması
    const user = await Subscribe.findOne({ email });
    if (user && user.isVerifiedEmail === true) {
      return res.json({ message: "Email already subscribed" });
    }

    if (!user || !user.verify_Code) {
      return res.status(404).json({
        message: "Verification code not found",
      });
    }

    if (user.verifyExpiredIn < Date.now()) {
      return res.status(400).json({
        message: "Verification code has expired",
      });
    }

    if (user.verify_Code !== Number(code)) {
      return res.status(400).json({
        message: "Verification code is incorrect",
      });
    }

    // 3. Təsdiqin tamlanması
    user.isVerifiedEmail = true;
    user.verify_Code = null;
    user.verifyExpiredIn = null;
    await user.save();

    return res.status(200).json({ message: "Email successfully verified!" });
  } catch (error) {
    console.error("Error in checkVerifyCode:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Controller export edilir
export const SubscribeController = () => ({
  createSubscriber,
  checkVerifyCode,
});
