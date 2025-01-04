import Joi from "joi";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { appConfig } from "../consts.js";
import { User } from "../models/user.model.js";
import { Subscribe } from "../models/subscribe.model.js";
import { transporter } from "../helpers.js";

const sendEmail = async (req, res, next) => {
  try {
    const { email } = await Joi.object({
      email: Joi.string().trim().email().required(),
    }).validateAsync(req.body);

    const subscribe = await Subscribe.findOne({ email });

    const user = await User.findOne({ email });

    if (user && user.isVerifiedEmail === true) {
      return res.json("Email is already verified, you can continue");
    }

    if (subscribe && subscribe.isVerifiedEmail === true) {
      return res.json("Email is already verified, you can continue");
    }

    const token = uuidv4();

    const verifyExpiredIn = moment().add(
      appConfig.VALIDITY_MINUTE_MAIL,
      "minutes"
    );

    const verifyUrl = `${appConfig.VERIFY_URL}${token}`;

    const mailOptions = {
      from: appConfig.EMAIL,
      to: email,
      subject: "Verify Email",
      html: `<h3>Verify Email</h3>
                   <p>To verify your email, click the link below:</p>
                   <a href="${verifyUrl}">Verify Email</a>
                   <p>This link is valid for ${appConfig.VALIDITY_MINUTE_MAIL} minute.</p>`,
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

    if (subscribe) {
      subscribe.verifyExpiredIn = verifyExpiredIn;
      subscribe.token = token;
      const { _id, isVerifiedEmail } = subscribe;
       res.status(201).json({_id, email, isVerifiedEmail });
      return subscribe.save();
    }

    const newSubscribe = await Subscribe.create({
      email,
      verifyExpiredIn,
      token,
    });
    const { _id, isVerifiedEmail } = newSubscribe;

    return res.status(201).json({ _id, email, isVerifiedEmail });


    
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};

const checkVerifyToken = async (req, res) => {
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

const subscribeList = async (req, res) => {
  const sbcList = await Subscribe.find();

  if (!sbcList.length) {
    return res.status(404).json({
      message: "No subscribe found.",
    });
  }

  const page = req.query.page || 1;
  const limit = req.query.perpage || 5;

  const before_page = (page - 1) * limit;
  const list = await Subscribe.find().skip(before_page).limit(limit);

  res.status(200).json({
    data: list,
    pagination: {
      sbcList,
      currentpage: page,
      messagesCount: list.length,
      allPages: Math.ceil(sbcList / limit),
    },
  });
};

export const subscribeController = () => ({
  sendEmail,
  checkVerifyToken,
  subscribeList,
});
