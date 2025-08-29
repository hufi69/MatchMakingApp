const { ResponseHandler } = require("../utils/responseHandler");

const validate = (schema) => (req, res, next) => {
  if (!req.body) {
    return ResponseHandler.badRequest(res, "No body provided");
  }
    const { error } = schema.validate(req.body);
    if (error) {
      return ResponseHandler.badRequest(res, error.details[0].message);
    }
 
      next();
    
  };
  
  module.exports = validate;