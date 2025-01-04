import Joi from "joi";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { error, userRoleList } from "../consts.js";
import { appConfig } from "../consts.js";
import { transporter } from "../helpers.js";

const userCreate = async (req, res, next) => {
  try {
    const validData = await Joi.object({
      name: Joi.string().trim().min(3).max(12).required(),
      surname: Joi.string().trim().min(3).max(12).required(),
      email: Joi.string().email().required(),
      password: Joi.string().trim().min(6).max(16).required(),
      role: Joi.string().trim(),
    }).validateAsync(req.body, { abortEarly: false });

    if (validData.role && !userRoleList.includes(validData.role)) {
      const error = new Error(`Invalid role! Allowed roles: ${userRoleList}`);
      error.status = 400;
      throw error;
    }

    const existUser = await User.findOne({ email: validData.email });

    if (existUser) {
      const error = new Error("User already exists");
      error.status = 409;
      throw error;
    }

    validData.password = await bcrypt.hash(validData.password, 10);

    const newUser = new User({ ...validData });
    await newUser.save();

    const mailOptions = {
      from: appConfig.EMAIL,
      to: validData.email,
      subject: "Hello",
      html: `<h3>Created User</h3>
          <p>You have been created as a user</p>
          <p>You can see the changes below:</p>
          <ul>
            <li><strong>Name:</strong> ${newUser.name}</li>
            <li><strong>Surname:</strong> ${newUser.surname}</li>
            <li><strong>Email:</strong> ${newUser.email}</li>
            <li><strong>Status:</strong> ${newUser.status}</li>
            <li><strong>Role:</strong> ${newUser.role}</li>
          </ul>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        const mailError = new Error("Error sending email");
        mailError.status = 500;
        throw mailError;
      } else {
        console.log("Email sent: ", info);
      }
    });

    const { _id, name, surname, email, role } = newUser;

    return res.status(201).json({ _id, name, surname, email, role });
  } catch (err) {
    next(err);
  }
};

const userEdit = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().trim().min(3).max(12),
      surname: Joi.string().trim().min(3).max(12),
      email: Joi.string().email(),
      role: Joi.string().trim(),
      status: Joi.string().trim().valid("active", "deactive"),
    });

    const validData = await schema.validateAsync(req.body, {
      abortEarly: false,
    });

    if (validData.role && !userRoleList.includes(validData.role)) {
      return res.status(400).json({
        message: `Invalid role! Allowed roles: ${userRoleList}`,
      });
    }

    const user = req.user;

    const changedFields = {};
    Object.keys(validData).forEach((key) => {
      if (validData[key] !== user[key]) {
        changedFields[key] = { old: user[key], new: validData[key] };
      }
    });

    if (Object.keys(changedFields).length === 0) {
      return res.status(200).json({ message: "Heç bir dəyişiklik yoxdur" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...validData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(500).json({ message: error[500] });
    }

    const mailOptions = {
      from: appConfig.EMAIL,
      to: user.email,
      subject: "Your Profile Has Been Updated",
      html: `<h3>Your Profile Updates</h3>
             <p>The following changes were made to your profile:</p>
             <ul>
               ${Object.keys(changedFields)
                 .map(
                   (key) =>
                     `<li><strong>${key}:</strong> ${changedFields[key].old} ➡ ${changedFields[key].new}</li>`
                 )
                 .join("")}
             </ul>`,
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

    const { _id, name, surname, email, role, status } = updatedUser;

    return res.status(200).json({ _id, name, surname, email, role, status });
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

const userDelete = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });

    return res.json({ message: "User uğurla silindi!" });
  } catch (err) {
    return res.status(500).json({ message: error[500], error: err.message });
  }
};

const adminList = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" });

    if (!admins.length) {
      return res.status(404).json({
        message: "No admins found.",
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.perpage || 5;

    const before_page = (page - 1) * limit;
    const list = await User.find({ role: "admin" })
      .skip(before_page)
      .limit(limit);

    res.status(200).json({
      data: list,
      pagination: {
        admins,
        currentpage: page,
        messagesCount: list.length,
        allPages: Math.ceil(admins / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: error[500],
      error: err.message,
    });
  }
};

const RoleList = async (req, res) => {
  res.json(userRoleList);
};

export const AdminController = () => ({
  userCreate,
  userEdit,
  userDelete,
  adminList,
  RoleList,
});
