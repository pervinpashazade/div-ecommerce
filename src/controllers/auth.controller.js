import Joi from "joi";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import moment from "moment";
import { appConfig, error } from "../consts.js";
import { v4 as uuidv4 } from "uuid";
import { transporter } from "../helpers.js";

const register = async (req, res) => {
  // 1. validation
  const validData = await Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    surname: Joi.string().trim().min(3).max(50).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).max(16).required(),
  })
    .validateAsync(req.body, { abortEarly: false })
    .catch((err) => {
      console.log("err", err);
      const errorList = err.details.map((item) => item.message);
      return res.status(422).json({
        message: "Validasiya xetasi bash verdi!",
        error: errorList,
      });
    });

  const existsUser = await User.findOne({
    email: validData.email,
  });
  if (existsUser) {
    return res.json({
      message: `${validData.email} - sistemde movcuddur!`,
    });
  }

  // 2. hash password
  validData.password = await bcrypt.hash(validData.password, 10);

  // 3. complete register
  const newUser = await User.create(validData);
  res.status(201).json(newUser);
};

const login = async (req, res) => {
  // 1. validate
  const validData = await Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).max(16).required(),
  })
    .validateAsync(req.body, { abortEarly: false })
    .catch((err) => {
      return res.status(422).json({
        message: "Xeta bash verdi!",
        error: err.details.map((item) => item.message),
      });
    });

  // 2. find user
  const user = await User.findOne({
    email: validData.email,
  });
  if (!user)
    return res.status(401).json({ message: "Email ve ya shifre sehvdir!" });

  // 3. Check password
  const isValidPassword = await bcrypt.compare(
    validData.password,
    user.password
  );
  if (!isValidPassword) {
    return res.status(401).json({
      message: "Email ve ya shifre sehvdir!",
    });
  }

  const jwt_payload = {
    sub: user._id,
  };

  // 4. create jwt_token
  const new_token = jwt.sign(jwt_payload, appConfig.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1d",
  });

  res.json({
    access_token: new_token,
  });
};

const verifyEmail = async (req, res, next) => {
  try {
    const email = req.user.email;

    if (req.user.isVerifiedEmail === true)
      return res.json({ message: "Email is already verified" });

    const verifyCode = Math.floor(100000 + Math.random() * 600000);

    const verifyExpiredIn = moment().add(appConfig.MINUTE, "minutes");

    req.user.verifyCode = verifyCode;
    req.user.verifyExpiredIn = verifyExpiredIn;

    await req.user.save();

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
    const validData = await Joi.object({
      code: Joi.number().min(100000).max(999999).required(),
    }).validateAsync(req.body, { abortEarly: false });

    const user = req.user;

    if (!user.verifyCode) {
      return res.status(400).json({
        message: "Verification code not found!",
      });
    }

    if (user.verifyExpiredIn < Date.now()) {
      return res.status(400).json("artıq vaxt bitib, yenidən cəhd edin");
    }

    if (user.verifyCode !== validData.code) {
      return res.status(400).json("kod eyni deyil");
    }
    req.user.isVerifiedEmail = true;
    req.user.verifyCode = null;
    req.user.verifyExpiredIn = null;
    await req.user.save();
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

const resetPass = async (req, res) => {
  const user = req.user;

  try {
    const existUser = await User.findById(user._id);
    if (!existUser) {
      return res.status(404).json({
        message: error[404],
      });
    }

    const validData = await Joi.object({
      password: Joi.string().min(6).trim().required(),
      newpassword: Joi.string().min(6).trim().required(),
    }).validateAsync(req.body, { abortEarly: false });

    const comparepass = await bcrypt.compare(
      validData.password,
      existUser.password
    );
    if (!comparepass) {
      return res.status(401).json({
        message: error[401],
      });
    }

    const userNewPassword = await bcrypt.hash(validData.newpassword, 10);
    existUser.password = userNewPassword;

    await existUser.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({
        message: error[422],
        error: err.details.map((item) => item.message),
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const ForgetPass = async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.status(401).json({
      message: "Belə bir istifadəçi yoxdur",
    });
  }

  const token = uuidv4();
  const resetExpiredIn = moment().add(appConfig.MINUTE, "minutes");

  res.json("Check your email");

  const resetUrl = `${appConfig.CLIENT_BASE_URL}${token}`;

  const mailOptions = {
    from: appConfig.EMAIL,
    to: req.body.email,
    subject: "Password Reset Request",
    html: `<h3>Password Reset</h3>
               <p>To reset your password, click the link below:</p>
               <a href="${resetUrl}">Reset Password</a>
               <p>This link is valid for ${appConfig.MINUTE} minute.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: "Error sending email", error });
    }
    return res
      .status(200)
      .json({ message: "Password reset email sent successfully." });
  });

  user.uuidToken = token;
  user.resetExpiredIn = resetExpiredIn;

  await user.save();
};

const CreatePass = async (req, res, next) => {
  const data = await Joi.object({
    newPassword: Joi.string().trim().min(6).max(16).required(),
  })
    .validateAsync(req.body)
    .catch((err) => {
      console.log("err:", err);
      return res.status(422).json({
        message: "Xeta bash verdi!",
        error: err.details.map((item) => item.message),
      });
    });

  const user = await User.findOne({
    uuidToken: req.params.uuidToken,
  });

  if (!user || !data.newPassword) {
    return res.status(401).json({
      message: "Token və ya password yoxdur",
    });
  }

  if (user.resetExpiredIn < Date.now()) {
    return res.status(401).json({
      message: "Artıq vaxt bitib, yenidən cəhd edin!!!",
    });
  }
  const ValidPassword = await bcrypt.compare(data.newPassword, user.password);

  if (ValidPassword) return res.json("Əvvəlki parolu yaza bilməzsiniz");

  const newPassword = await bcrypt.hash(data.newPassword, 10);

  user.password = newPassword;
  user.uuidToken = null;
  await user.save();
  res.send(`${user.email} mailinin password-ü yeniləndi`);
};

export const AuthController = () => ({
  login,
  register,
  resetPass,
  verifyEmail,
  checkVerifyCode,
  ForgetPass,
  CreatePass,
});
