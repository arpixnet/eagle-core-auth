import Joi from '@hapi/joi';

export const signupValidation = (data: any) => {
    const userSchema = Joi.object({
        email: Joi
            .string()
            .required()
            .email(),
        username: Joi
            .string()
            .min(4),
        password: Joi
            .string()
            .min(6)
            .required()
            .pattern(new RegExp('^[a-zA-Z0-9$@$!%*?&]{6,30}$'))
            .error(new Error('\"password\" fails to match the required'))
    });
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
            .min(6)
            .required()
            .pattern(new RegExp('^[a-zA-Z0-9$@$!%*?&]{6,30}$'))
            .error(new Error('\"password\" fails to match the required'))
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

export const passwordValidation = (data: any) => {
    const userSchema = Joi.object({
        password: Joi
            .string()
            .min(6)
            .required()
            .pattern(new RegExp('^[a-zA-Z0-9$@$!%*?&]{6,30}$'))
            .error(new Error('\"password\" fails to match the required')),
        newPassword: Joi
            .string()
            .min(6)
            .required()
            .pattern(new RegExp('^[a-zA-Z0-9$@$!%*?&]{6,30}$'))
            .error(new Error('\"new password\" fails to match the required'))
    });
    return userSchema.validate(data);
};
