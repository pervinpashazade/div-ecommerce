import Joi from "joi"
import bcrypt from "bcrypt"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"
import 'dotenv/config';
import { appConfig } from "../consts.js"

const register = async (req, res) => {
    // 1. validation
    const validData = await Joi.object({
        name: Joi.string().trim().min(3).max(50).required(),
        surname: Joi.string().trim().min(3).max(50).required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().trim().min(6).max(16).required(),
    })
        .validateAsync(req.body, { abortEarly: false })
        .catch(err => {
            console.log("err", err);
            const errorList = err.details.map(item => item.message);
            return res.status(422).json({
                message: "Validasiya xetasi bash verdi!",
                error: errorList
            })
        })

    const existsUser = await User.findOne({
        email: validData.email
    })
    if (existsUser) {
        return res.json({
            message: `${validData.email} - sistemde movcuddur!`
        })
    }

    // 2. hash password
    validData.password = await bcrypt.hash(validData.password, 10)

    // 3. complete register
    const newUser = await User.create(validData)
    res.status(201).json(newUser)
}

const login = async (req, res) => {
    // 1. validate
    const validData = await Joi.object({
        email: Joi.string().trim().email().required(),
        password: Joi.string().trim().min(6).max(16).required(),
    }).validateAsync(req.body, { abortEarly: false })
        .catch(err => {
            return res.status(422).json({
                message: "Xeta bash verdi!",
                error: err.details.map(item => item.message)
            })
        })

    // 2. find user
    const user = await User.findOne({
        email: validData.email,
    })
    if (!user) {
        return res.status(401).json({
            message: "Email ve ya shifre sehvdir!"
        })
    }

    // 3. Check password
    const isValidPassword = await bcrypt.compare(validData.password, user.password)
    if (!isValidPassword) {
        return res.status(401).json({
            message: "Email ve ya shifre sehvdir!"
        })
    }

    const jwt_payload = {
        sub: user._id,
    }

    // 4. create jwt_token
    const new_token = jwt.sign(jwt_payload, appConfig.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "1d"
    })

    res.json({
        access_token: new_token,
    })
}

export const AuthContoller = () => ({
    login,
    register,
})