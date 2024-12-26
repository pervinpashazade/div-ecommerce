import jwt from "jsonwebtoken";
import "dotenv/config";
import { appConfig, error } from "../consts.js";
import { User } from "../models/user.model.js";

export const useAuth = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.status(401).json({
      message: "Token tapilmadi",
    });
  }

  const access_token = req.headers.authorization.split(" ")[1];
  if (!access_token)
    return res.status(401).json({
      message: "Token tapilmadi",
    });

  try {
    const jwtResult = jwt.verify(access_token, appConfig.JWT_SECRET);

    const user = await User.findById(jwtResult.sub).select(
      "_id email name surname role isVerifiedEmail verifyCode verifyExpiredIn uuidToken resetExpiredIn status"
    );
    if (!user) return res.status(401).json({ message: "User not found!" });

    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};

export const roleCheck = (role) => {
  return (req, res, next) => {
    const userRole = req.user.role;


    if (!role.includes(userRole)) {
      return res.status(403).json({ message: error[403] });
    }

    if(req.user.status === "deactive"){
      return res.json("Siz active user deyilsiniz!!!")
    }

    next();
  };
};

export const idCheck=async(req,res,next)=>{
 try {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: error[400] });
  }
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: error[404] });
  }
 
  req.user = user
  next()
 } catch (error) {
  return res.status(500).json({
    message: error.message,
    error,
  });
 }
}