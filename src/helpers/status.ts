const msgErrors = {
    NOT_EMAIL_OR_PASSWORD: {
        error: {
            message: 'You must enter a valid username and password',
            code: 400
        }
    },
    EMAIL_EXISTS: {
        error: {
            message: 'Existing username',
            code: 400
        }
    },
    OPERATION_NOT_ALLOWED: {
        error: {
            message: 'Operation not allowed',
            code: 400
        }
    },
    UNEXPECTED_ERROR_TRY_LATER: {
        error: {
            message: 'Unexpected error try later',
            code: 400
        }
    },
    EMAIL_NOT_FOUND: {
        error: {
            message: 'Username not fount',
            code: 400
        }
    },
    EMAIL_NOT_VERIFIED: {
        error: {
            message: 'Email not verified',
            code: 400
        }
    },
    INVALID_PASSWORD: {
        error: {
            message: 'Invalid password',
            code: 400
        }
    },
    INVALID_EMAIL: {
        error: {
            message: 'Invalid email',
            code: 400
        }
    },
    USER_DISABLED: {
        error: {
            message: 'User Disabled',
            code: 400
        }
    },
    INVALID_IDP_RESPONSE: {
        error: {
            message: 'Invalid IDP response',
            code: 400
        }
    },
    EXPIRED_OOB_CODE: {
        error: {
            message: 'Verification code expired',
            code: 400
        }
    },
    INVALID_OOB_CODE: {
        error: {
            message: 'Invalid verification code',
            code: 400
        }
    },
    INVALID_ID_TOKEN: {
        error: {
            message: 'Invalid token',
            code: 400
        }
    },
    WEAK_PASSWORD: {
        error: {
            message: 'Weak password',
            code: 400
        }
    },
    USER_NOT_FOUND: {
        error: {
            message: 'User not found',
            code: 400
        }
    },
    TOKEN_EXPIRED: {
        error: {
            message: 'Token expired',
            code: 400
        }
    },
    UNAUTHORIZED: {
        error: {
            message: 'Unauthorized',
            code: 401
        }
    },
    NOT_ROLE: {
        error: {
            message: 'You must enter a valid role',
            code: 400
        }
    },
    LOGIN_EXCEEDED: {
        error: {
            message: 'You have exceeded the number of logins allowed',
            code: 400
        }
    }
}

export {
    msgErrors
}