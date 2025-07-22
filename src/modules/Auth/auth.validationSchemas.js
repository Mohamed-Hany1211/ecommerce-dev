// modules imports
import Joi from "joi"
// files imports
import { systemRoles } from "../../utils/system-roles.js"
import { userGender } from "../../utils/user-gender.js"
// signUp schema
export const signUpSchema = {
    body: Joi.object({
        userName: Joi.string().pattern(new RegExp(/^[a-zA-Z0-9 ]{3,30}$/)).min(3).required(),
        email:Joi.string().email().required(),
        password:Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>/?\\|\[\]]).{8,}$/)).required(),
        phoneNumbers: Joi.array().items(Joi.string().pattern(new RegExp(/^(\+?[1-9]\d{0,3})?[-.\s]?(\(?\d{1,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/)).required()),
        addresses: Joi.array().items(Joi.string().required()),
        role: Joi.string().valid(...Object.values(systemRoles)).required(),
        age: Joi.number().min(18).max(100).required(),
        gender: Joi.string().valid(...Object.values(userGender)).required()
    })
}

// signIn schema
export const signInSchema = {
    body: Joi.object({
        email:Joi.string().email().required(),
        password:Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>/?\\|\[\]]).{8,}$/)).required()
    })
}

// verify email schema

export const verifyEmailSchema = {
    query: Joi.object({
        token: Joi.string().required()
    })
}
