const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string().required(),
    location: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("brand", "influencer").required(),
    profilePicture: Joi.string().optional().allow(null, '')
});

const verificationSchema = Joi.object({
    email: Joi.string().email().required(),
    selfieUrls: Joi.array().items(Joi.string()).required(),
    idUrls: Joi.array().items(Joi.string()).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const verifyOTPSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.number().required(),
})

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.number().required(),
    newPassword: Joi.string().min(6).required()
});

const resendOTPSchema = Joi.object({
    email: Joi.string().email().required()
});

const twoFASchema = Joi.object({
    twoFAEnabled: Joi.boolean().required()
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});


module.exports = {
    registerSchema,
    loginSchema,
    verifyOTPSchema,
    verificationSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    resendOTPSchema,
    twoFASchema,
  changePasswordSchema,
};