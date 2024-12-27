import Joi from "joi"
import { User } from "../models/user.model.js"
import { Contact } from "../models/contact.model.js"


const create = async (req, res, next) => {

  const data = await Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.alternatives().try(
        Joi.string().pattern(/^\+?[0-9]{10,15}$/), // Beynəlxalq format
        Joi.string().pattern(/^[0-9]{10}$/)       // Yalnız 10 rəqəm
      ).required(),
    message: Joi.string().trim().min(3).max(200).required(),
  }).validateAsync(req.body, { abortEarly: false })
    .catch(err => {
      return res.status(422).json({
        message: "Xeta bash verdi!",
        error: err.details.map(item => item.message)
      })
    })

  const existMail = await User.findOne({
    email: data.email,
  });

  if (!existMail) {
    return res.status(409).json({
      message: "Bu email-ə uygun user movcud deyil",
    });
  }
  await Contact.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message
  }).then(newMessage => res.status(201).json(newMessage))
    .catch(error => res.status(500).json({
      message: "Xeta bash verdi!",
      error,
    }))
}

const allMessages = async (req, res, next) => {
  try {
    const page = req.query.page || 1
    const limit = req.query.perpage || 5
    const allMessages = await Contact.countDocuments()

    if (allMessages.length === 0) {
      return res.status(404).json({
        message: "Message tapilmadi",
      });
    }

    const before_page= (page - 1) * limit
    const list = await Contact.find().skip(before_page).limit(limit)

    res.status(200).json({
      data: list,
      pagination: {
        allMessages,
        currentpage: page,
        messagesCount: list.length,
        allPages: Math.ceil(allMessages / limit)
      }
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server xetasi bas verdi",
      error: error.message,
    });
  }

}

const getMessage = async (req, res, next) => {
    try {
      const id = req.params.id;
  
      const message = await Contact.findById(id);
  
      if (!message) {
        return res.status(400).json({
          message: "Message tapilmadi",
        });
      }
  
      res.status(200).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server xetasi bas verdi",
        error: error.message,
      });
    }
  };
  
export const contactController = () => ({
    create,
    allMessages,
    getMessage
  })