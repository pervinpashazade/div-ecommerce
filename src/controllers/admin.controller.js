import Joi from "joi";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { appConfig, error } from "../consts.js";


const adminCreate = async (req, res, next) => {
  const validData = await Joi.object({
    name: Joi.string().trim().min(3).max(12).required(),
    surname: Joi.string().trim().min(3).max(12).required(),
    email: Joi.string().email().required(),
    password: Joi.string().trim().min(6).max(16).required(),
    role: Joi.string().trim().optional(),
  })
    .validateAsync(req.body, { abortEarly: false })
    .catch((err) => {
      return res.status(422).json({
        message: error[422],
        error: err.details.map((item) => item.message),
      });
    });
  try {
    validData.password = await bcrypt.hash(validData.password, 10);

    const newAdmin = new User({
      ...validData,
      role: "admin",
    });
    await newAdmin.save();
    console.log(newAdmin.email);

    return res.status(201).json(newAdmin);
  } catch (err) {
    return res.status(500).json({
      message: error[500],
      error: err.message,
    });
  }
};

const adminEdit = async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().trim().min(3).max(12),
      surname: Joi.string().trim().min(3).max(12),
      email: Joi.string().email(),
    });

    const validData = await schema.validateAsync(req.body, {
      abortEarly: false,
    });

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

    return res.status(200).json(updatedAdmin);
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
const adminDelete = async (req, res) => {
  try {
    await User.deleteOne({ _id });

    return res.json({ message: "Admin uğurla silindi." });
  } catch (err) {
    return res.status(500).json({ message: error[500], error: err.message });
  }
};

const adminRole = async (req, res, next) => {
  try {
    const schemaRole = Joi.object({
      role: Joi.string().trim().optional(),
    });

    const validData = await schemaRole.validateAsync(req.body);

    const updatedRole = await User.findByIdAndUpdate(req.params.id, validData, {
      new: true,
    });

    res.json(updatedRole);
  } catch (err) {
    if (err.isJoi) {
      return res.status(422).json({
        message: error[422],
      });
    }
    res.status(500).json({ message: error[500] });
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

export const AdminController = () => ({
  adminCreate,
  adminEdit,
  adminRole,
  adminDelete,
  adminList,
});
