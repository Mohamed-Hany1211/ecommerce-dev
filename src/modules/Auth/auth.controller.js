// modules imports
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// files imports
import User from '../../../DB/models/user.model.js';
import sendEmailService from '../../services/Send-mail.service.js';

// ======================= signUp api ========================= //

/* 
    // 1- destructing the required data from the request body
    // 2- check if user is already exist in database using the email
    // 2.1 - sending confirmation email to the user
    // 3- hashing the password
    // 4- creating a new user document in the database
    // 5- check if the user created successfully 
    // 6- return the response
*/

export const signUp = async (req, res, next) => {
    // 1- destructing the required data from the request body
    const {
        username,
        email,
        password,
        phoneNumbers,
        addresses,
        role,
        age
    } = req.body;
    // 2- check if user is already exist in database using the email 
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
        return next(new Error(`email is already exist `, { cause: 409 }));
    }

    // 2.1 - sending confirmation email to the user
    const userToken = jwt.sign({ email }, process.env.JWT_SECRET_VEREFICATION, { expiresIn: '1h' });
    const isEmailSent = await sendEmailService({
        to: email,
        subject: 'Email verification',
        message: `<h2>Please click on this link to verify your email</h2>
        <a href='http://localhost:3000/auth/verify-email?token=${userToken}'>Verify Email</a>
        `
    })
    if (!isEmailSent) {
        return next(new Error(`unable to send email , please try again later`, { cause: 500 }));
    }

    // 3- hashing the password
    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

    // 4- creating a new user document in the database
    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        phoneNumbers,
        addresses,
        role,
        age
    })
    //5- check if the user created successfully 
    if (!newUser) {
        return next(new Error(`unable to create user`, { cause: 500 }));
    }
    // 6- return the response
    return res.status(201).json({
        success:true,
        message: 'user created successfully , please check your email to verify your account',
        data: newUser
    })
}

// ====================== verify the email ======================== //

/*
    // 1 - verify user token
    // 2 - get user by email whith isEmailVerified = false
    // 3 - check if the user has found
    // 4 - return the response
*/

export const verifyEmail = async (req, res, next) => {
    const { token } = req.query;
    // 1 - verify user token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VEREFICATION);
    // 2 - get user by email whith isEmailVerified = false
    const findUser = await User.findOneAndUpdate({ email: decodedData.email, isEmailVerified: false }, { isEmailVerified: true }, { new: true });
    // 3 - check if the user has found
    if (!findUser) {
        return next(new Error(`user not foud`, { cause: 404 }));
    }
    // 4 - return the response
    res.status(200).json({
        success: true,
        message: 'email verified successfully , please try to login',
        data: findUser
    })
}

// ==================== signIn api ================================ //

/*
    // 1 - check if user is exist in database using the email
    // 2 - compare password with hashed password
    // 3 - create token
    // 4 - create flag for loggedIn User
    // 5 - return the response
*/

export const signIn = async (req, res, next) => {
    const {email,password} = req.body;
    // 1 - check if user is exist in database using the email
    const userFound = await User.findOne({email,isEmailVerified:true});
    if(!userFound){
        return next(new Error(`Invalid login credentials , please signUp`, { cause: 404 }));
    }
    // 2 - compare password with hashed password
    const verifyPass = bcrypt.compareSync(password,userFound.password);
    if(!verifyPass){
        return next(new Error(`invalid password`, { cause: 401 }));
    }
    // 3 - create token
    const userToken = jwt.sign({email,id:userFound._id,loggedIn:true},process.env.JWT_SECRET_LOGIN,{expiresIn:'1h'});
    // 4 - create flag for loggedIn User
    userFound.isloggedIn = true;
    await userFound.save();
    // 5 - return the response
    return res.status(200).json({
        success:true,
        message:'User logged in successfully',
        data:userToken
    })
}

