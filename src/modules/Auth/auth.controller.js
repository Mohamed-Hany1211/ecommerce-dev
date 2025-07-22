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
    // 3 - sending confirmation email to the user
        // 3.1 - check if the email is sent successfully
    // 4 - save the password hashed
    // 5 - creating a new user document in the database
        // 5.1 - check if the user is created successfully
    // 6- return the response
*/

export const signUp = async (req, res, next) => {
    // 1- destructing the required data from the request body
    const {
        userName,
        email,
        password,
        phoneNumbers,
        addresses,
        role,
        age,
        gender
    } = req.body;
    // 2- check if user is already exist in database using the email 
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
        return next({ message: 'email is already exist , please try to login', cause: 409 });
    }

    // 3 - sending confirmation email to the user
    const userToken = jwt.sign({ email }, process.env.JWT_SECRET_VEREFICATION, { expiresIn: '1h' });
    const isEmailSent = await sendEmailService({
        to: email,
        subject: 'Email verification',
        message: `<section style="width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center;">
        <div style="width: 50%; background-color: rgba(128, 128, 128,0.3); height: 20vh; border-radius: .625rem; text-align: center;">
            <h2 style=" color: black; text-shadow: 7px 7px 5px  white;display:block;font-size:25px;">Please click the link to verify your account</h2>
            <a style="text-decoration: none; font-size: 20px; " href='http://localhost:3000/auth/verify-email?token=${userToken}'>Verify Account</a>
        </div>
    </section>`
    })
    // 3.1 - check if the email is sent successfully
    if (!isEmailSent) {
        return next({ message: 'unable to send email , please try again later', cause: 500 });
    }
    // 4 - save the password hashed
    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);
    // 5 - creating a new user document in the database
    const newUser = await User.create({
        userName,
        email,
        password: hashedPassword,
        phoneNumbers,
        addresses,
        role,
        age,
        gender
    })
    // 5.1 - check if the user is created successfully
    if (!newUser) {
        return next({ message: 'unable to create user', cause: 500 });
    }
    // 6- return the response
    return res.status(201).json({
        success: true,
        message: 'user created successfully , please check your email to verify your account',
        data: newUser
    })
}

// ====================== verify the email ======================== //

/*
    // 1- destructing the user token from the request query
    // 2 - verify user token
    // 3 - get user by email with isEmailVerified = false
    // 4 - check if the user has found
    // 5 - return the response
*/

export const verifyEmail = async (req, res, next) => {
    // 1- destructing the user token from the request query
    const { token } = req.query;
    // 2 - verify user token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VEREFICATION);
    // 3 - get user by email with isEmailVerified = false
    const findUser = await User.findOneAndUpdate({ email: decodedData.email, isEmailVerified: false }, { isEmailVerified: true }, { new: true });
    // 4 - check if the user has found
    if (!findUser) {
        return next(new Error(`user not foud`, { cause: 404 }));
    }
    // 5 - return the response
    res.status(200).json({
        success: true,
        message: 'email verified successfully , please try to login'
    })
}

// ==================== signIn api ================================ //

/*
    // 1- destructing the required data from the request body
    // 2 - check if user is exist in database using the email
        // 2.1 - check if the user is found
    // 3 - compare password with hashed password
        // 3.1 - check if the password is correct
    // 4 - create token
    // 5 - create flag for loggedIn User
    // 6 - save the changes 
    // 7 - return the response
*/

export const signIn = async (req, res, next) => {
    // 1- destructing the required data from the request body
    const { email, password } = req.body;
    // 2 - check if user is exist in database using the email
    const userFound = await User.findOne({ email, isEmailVerified: true });
    // 2.1 - check if the user is found
    if (!userFound) {
        return next({ message: 'Invalid login credentials , please signUp', cause: 404 });
    }
    // 3 - compare password with hashed password
    const verifyPass = bcrypt.compareSync(password, userFound.password);
    // 3.1 - check if the password is correct
    if (!verifyPass) {
        return next({ message: 'Invalid password', cause: 401 });
    }
    // 4 - create token
    const userToken = jwt.sign({ email, id: userFound._id, loggedIn: true }, process.env.JWT_SECRET_LOGIN, { expiresIn: '1h' });
    // 5 - create flag for loggedIn User
    userFound.isloggedIn = true;
    // 6 - save the changes 
    await userFound.save();
    // 7 - return the response
    return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: userToken
    })
}

