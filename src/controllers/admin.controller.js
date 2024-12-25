import Joi from "joi";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { error, usersList } from "../consts.js";

const userCreate = async (req, res, next) => {
  const validData = await Joi.object({
    name: Joi.string().trim().min(3).max(12).required(),
    surname: Joi.string().trim().min(3).max(12).required(),
    email: Joi.string().email().required(),
    password: Joi.string().trim().min(6).max(16).required(),
    role: Joi.string().trim(),
  })
    .validateAsync(req.body, { abortEarly: false })
    .catch((err) => {
      return res.status(422).json({
        message: error[422],
        error: err.details.map((item) => item.message),
      });
    });

  if (validData.role && !usersList.includes(validData.role)) {
    return res.status(400).json({
      message: `Invalid role! Allowed roles: ${usersList}`,
    });
  }

  try {
    const existAdmin = await User.findOne({ email: validData.email });

    if (existAdmin)
      return res.status(409).json({
        message: error[409],
      });

    validData.password = await bcrypt.hash(validData.password, 10);

    const newAdmin = new User({
      ...validData,
    });
    await newAdmin.save();

    const { _id, name, surname, email, role } = newAdmin;

    return res.status(201).json({ _id, name, surname, email, role });
  } catch (err) {
    return res.status(500).json({
      message: error[500],
      error: err.message,
    });
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

    if (validData.role && !usersList.includes(validData.role)) {
      return res.status(400).json({
        message: `Invalid role! Allowed roles: ${usersList}`,
      });
    }

    const user = req.user

    const isUnchanged =
      user.name === (validData.name || user.name) &&
      user.surname === (validData.surname || user.surname) &&
      user.email === (validData.email || user.email) &&
      user.role === (validData.role || user.role) &&
      user.status === (validData.status || user.status);

    if (isUnchanged) {
      return res.status(200).json({ message: "Heç bir dəyişiklik yoxdur" });
    }

    const updatedAdmin = await User.findByIdAndUpdate(
      req.params.id,
      { ...validData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAdmin) {
      return res.status(500).json({ message: error[500] });
    }

    const { _id, name, surname, email, role , status} = updatedAdmin;

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
    await User.deleteOne({ _id });

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

    return res.status(200).json(admins);
  } catch (err) {
    return res.status(500).json({
      message: error[500],
      error: err.message,
    });
  }
};

const userList = async (req, res) => {
  res.json(usersList);
};

export const AdminController = () => ({
  userCreate,
  userEdit,
  userDelete,
  adminList,
  userList,
});
