import Joi from '@hapi/joi';
import config from '../config/config';

export const signupValidation = (data: any) => {
    let userSchema:any;
    if (config.auth.passwordStrong) {
        userSchema = Joi.object({
            email: Joi
                .string()
                .required()
                .email(),
            username: Joi
                .string()
                .min(4),
            password: Joi
                .string()
                .min(config.auth.passwordMin)
                .required()
                .pattern(new RegExp(`(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{${config.auth.passwordMin},})`))
                .error(new Error('\"password\" fails to match the required'))
        });
    } else {
        userSchema = Joi.object({
            email: Joi
                .string()
                .required()
                .email(),
            username: Joi
                .string()
                .min(4),
            password: Joi
                .string()
                .min(config.auth.passwordMin)
                .required()
        });
    }
    return userSchema.validate(data);
};

export const signinValidation = (data: any) => {
    const userSchema = Joi.object({
        email: Joi
            .string()
            .email(),
        username: Joi
            .string()
            .min(4),
        password: Joi
            .string()
            .required()
    })
    .with('email', 'password')
    .with('username', 'password')
    return userSchema.validate(data);
};

export const emailValidation = (data: any) => {
    const userSchema = Joi.object({
        email: Joi.string().email().required()
    });
    return userSchema.validate(data);
};

export const userValidation = (data: any) => {
    const userSchema = Joi.object({
        username: Joi
            .string()
            .min(4),
        mobile: Joi.number().integer(),
        photo_url: Joi.string().uri()
    });
    return userSchema.validate(data);
};

export const passwordValidation = (data: any) => {
    let userSchema:any;
    if (config.auth.passwordStrong) {
        userSchema = Joi.object({
            newPassword: Joi
                .string()
                .min(config.auth.passwordMin)
                .required()
                .pattern(new RegExp(`(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{${config.auth.passwordMin},})`))
                .error(new Error('\"new password\" fails to match the required'))
        });
    } else {
        userSchema = Joi.object({
            newPassword: Joi
                .string()
                .min(config.auth.passwordMin)
                .required()
        });
    }
    return userSchema.validate(data);
};
