import Joi, { exist } from "joi";
import { Subscribe } from "../models/subscriber.model";
import { appConfig } from "../consts";
import { nodemailer } from "nodemailer";

const subscriber = async (req, res, next) => {
  const { email } = await Joi.object({
    email: Joi.string().trim().email().required(),
  })
    .validateAsync(req.body)
    .catch((err) => {
      return res.status(422).json({
        message: "Validation error",
        err,
      });
    });
  const existsSubscriber = await Subscribe.findOne({
    email: email,
  });
  if (existsSubscriber && existsSubscriber.isVerifiedEmail) {
    return res.json({ message: "Email already subscribed" });
  }
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  const verifyExpiredIn = new Date(
    Date.now() + appConfig.VERIFYEXPIREDIN * 60 * 1000
  );
  if (existsSubscriber) {
    (existsSubscriber.verify_Code = verificationCode),
      (existsSubscriber.verifyExpiredIn = verifyExpiredIn);
    await existsSubscriber.save();
    return res.json({ message: "Verification code updated" });
  }
  const newSubscriber = await Subscribe.create({
    email,
    verifyExpiredIn,
    verify_Code,
  });
  res.json({message:"New subscriber created"});
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: appConfig.EMAIL,
      pass: appConfig.EMAIL_PASS,
    },
  });
  const mailData = {
    from: appConfig.EMAIL,
    to: email,
    subject: "Email Verification Code",
    text: `Your verification code is: ${verify_code}`,
  };
  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
      return res.status(500).json({
        message: error.message,
        error,
      });
    } else {
      console.log("Email sent: ", info);
      return res.json({
        message: `Check your email .It will expire in ${appConfig.VERIFYEXPIREDIN} minutes`,
      });
    }
  });
};
const checkVerifyCode = async (req, res, next) => {
  try {
    const validData = await Joi.object({
      code: Joi.length(6)
        .regex(/^[0-9]+$/)
        .required(),
    }).validateAsync(req.body, { abortEarly: false });
    const user =req.existsSubscriber
    if (!verify_code)
      return res.status(404).json({
        message: "Veritification code is not found",
      });
    if (existsSubscriber.verifyExpiredIn < new Date())
      return res.status(404).json({
        message: "Veritification code is expired ",
      });
    if ((existsSubscriber.verify_Code = Number(validData.code)))
      return res.status(400).json({
        message: "Veritificition code is incorrect",
      });
      existsSubscriber.isVerifiedEmail = true;
      existsSubscriber.verify_Code = null;
      existsSubscriber.verifyExpiredIn = null;
    await existsSubscriber.save()
    return res.json({ message: "Code verified" });
  } catch (error) {
    console.error("Error:", error);
  }
};

export const SubscribeController = () => ({
  subscriber,
  checkVerifyCode,
});
