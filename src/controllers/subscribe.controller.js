import Joi from "joi";
import { error } from "../consts.js";
import { subscribeModel } from "../models/subscribe.model.js";
import moment from "moment/moment.js";
import { sendEmailMessage } from "../Utility/email.sent.js";
import { faker } from "@faker-js/faker";

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
    const emailMessage = await sendEmailMessage(
      validEmail.email,
      "Email Verification",
      `Your verification code is ${code}. It expires in ${isExpired}.`
    );
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
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "Email tələb olunur." });
  }

  try {
    const validationSchema = Joi.object({
      code: Joi.number().integer().min(100000).max(999999).required(),
    });

    const { code } = await validationSchema.validateAsync(req.body);

    const existEmail = await subscribeModel.findOne({ email });
    if (!existEmail) {
      return res.status(400).json({ message: "Bu email mövcud deyil." });
    }

    if (existEmail.isexpiredAt < Date.now()) {
      return res.status(400).json({ message: "Kodun vaxtı bitmişdir." });
    }

    if (existEmail.verifyCode !== code) {
      return res.status(400).json({ message: "Kod yanlışdır." });
    }
    existEmail.isVerify = true;
    existEmail.verifyCode = 0;
    existEmail.isexpiredAt = null;
    const isEmailSent = await sendEmailMessage(
      existEmail.email,
      "E-posta Doğrulama",
      "E-postaniz aktivlesdirildi."
    );

    if (!isEmailSent) {
      return res
        .status(500)
        .json({ message: "E-posta bildirimi gönderilmedi." });
    }

    await existEmail.save();

    res.status(200).json({ message: "Email aktivləşdirildi!" });
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

const fakeUserGenerate = async (req, res) => {
  const {count} = req.query
  const fakeUsers=[]
  
  for (let index = 0; index < count; index++) {
    
    fakeUsers.push({
      email: faker.internet.email(),
      isVerify: false,
      verifyCode: 0,
      isexpiredAt: faker.date.future()
    })
    
    console.log(fakeUsers, " useressss");

  }
  const createdUsers=await subscribeModel.insertMany(fakeUsers)
  res.json(createdUsers)
}


export const subscribeController = () => {
  return { subscribeEmail, subscribeVerify, fakeUserGenerate };
};
