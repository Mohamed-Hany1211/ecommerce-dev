import User from '../../../DB/models/user.model.js';

// ========================== update user api ========================= //

/*
    // 1 - destructing the user id from the authUser
    // 2 - destructing the required data from the request body
    // 3 - get the user by id
    // 4 - check if the user want to update the name feild
        // 4.1 - check if the new user name diffrent from the old one
        // 4.2 - update the user name and slug
    // 5 - check if the user want to update the age feild
        // 5.1 - check if the new age diffrent from the old one
        // 5.2 - update the age
    // 6 - check if the user want to update the phone numbers feild
        // 6.1 - check if the new phone numbers diffrent from the old one
        // 6.2 - update the phone numbers
    // 7 - check if the user want to update the addresses feild
        // 7.1 - check if the new addresses diffrent from the old one
        // 7.2 - update the addresses
    // 8 - save the updates 
    // 9 - return the response 
*/

export const updateUser = async (req, res, next) => {
    // 1 - destructing the user id from the authUser
    const { _id } = req.authUser;
    // 2 - destructing the required data from the request body
    const {
        newUserName,
        newAge,
        newPhoneNumbers,
        newAddresses
    } = req.body;
    // 3 - get the user by id
    const user = await User.findById(_id);
    // 4 - check if the user want to update the name feild
    if(newUserName){
        // 4.1 - check if the new user name diffrent from the old one
        if(newUserName == user.userName){
            return next({message:'please enter diffrent user name from the existing one',cause:400})
        }
        // 4.2 - update the user name and slug
        user.userName = newUserName;
    }
    // 5 - check if the user want to update the age feild
    if(newAge){
        // 5.1 - check if the new age diffrent from the old one
        if(newAge == user.age){
            return next({message:'please enter diffrent age from the existing one',cause:400})
        }
        // 5.2 - update the age
        user.age = newAge;
    }
    // 6 - check if the user want to update the phone numbers feild
    if(newPhoneNumbers){
        // 6.1 - check if the new phone numbers diffrent from the old one
        if(user.phoneNumbers.includes(newPhoneNumbers)){
            return next({message:'please enter diffrent phone numbers from the existing phone numbers',cause:400})
        }
        // 6.2 - update the phone numbers
        user.phoneNumbers = newPhoneNumbers;
    }
    // 7 - check if the user want to update the addresses feild
    if(newAddresses){
        // 7.1 - check if the new addresses diffrent from the old one
        if(user.addresses.includes(newAddresses)){
            return next({message:'please enter diffrent addresses from the existing addresses',cause:400})
        }
        // 7.2 - update the addresses
        user.addresses = newAddresses;
    }
    // 8 - save the updates 
    await user.save();
    // 9 - return the response 
    res.status(200).json({
        success: true,
        message: 'user updated successfully',
        data: user
    })
}

// ============================ delete user profile ======================= //

/*
    // 1 - destructing the user id from authUser
    // 2 - get the user by id and delete him
    // 3 - check if the user deleted or not
    // 4 - return the response 
*/

export const deleteUserProfile = async (req,res,next) =>{
    // 1 - destructing the user id from authUser
    const { _id } = req.authUser;
    // 2 - get the user by id and delete him
    const deletedUser = await User.findByIdAndDelete(_id);
    // 3 - check if the user deleted or not
    if(!deletedUser){
        return next(new Error('user not found ', { cause: 404 }));
    }
    // 4 - return the response 
    res.status(200).json({
        success:true,
        message:'the account deleted successfully'
    });
}

// =============================== get user profile data ===================== //
/*
    // 1 - destructing the user id from the authUser
    // 2 - get the user by id
    // 3 - check if the user found or not 
    // 4 - return the response 
*/
export const getUserProfile = async (req,res,next)=>{
    // 1 - destructing the user id from the authUser
    const { _id } = req.authUser;
    // 2 - get the user by id
    const user = await User.findById(_id);
    // 3 - check if the user found or not 
    if(!user){
        return next({message:'User Not Found', cause:404});
    }
    // 4 - return the response 
    res.status(200).json({
        success:true,
        message:`user profile data fetched successfully`,
        data:user
    });
}