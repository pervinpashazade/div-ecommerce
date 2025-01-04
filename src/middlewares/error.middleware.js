// error.middleware.js
export const errorMiddleware = (err, req, res, next) => {
    console.error("Error occurred:", err);
  
    if (err.isJoi) {
      // Joi validation error
      return res.status(422).json({
        message: "Validation error",
        errors: err.details.map((detail) => detail.message),
      });
    }
  
    if (err.name === "CastError") {
      // MongoDB CastError (e.g., invalid ObjectId)
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }
  
    if (err.code === 11000) {
      // MongoDB Duplicate Key Error
      return res.status(409).json({
        message: "Duplicate value error",
        error: err.keyValue,
      });
    }
  
    if (err.status) {
      // Custom error with a defined status
      return res.status(err.status).json({
        message: err.message,
        error: err.details || {},
      });
    }
  
    // Default server error
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  };
  