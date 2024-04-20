import User from '../../../DB/models/user.model.js';

// ========================== update user api ========================= //

/*
    // 1 - destructing the requierd data
    // 2 - get the user by id
    // 3 - check if the user want to update the name feild
        // 3.1 - check if the new user name diffrent from the old one
        // 3.2 - update the user name and slug
    // 4 - check if the user want to update the age feild
        // 4.1 - check if the new age diffrent from the old one
        // 4.2 - update the age
    // 5 - check if the user want to update the phone numbers feild
        // 5.1 - check if the new phone numbers diffrent from the old one
        // 5.2 - update the phone numbers
    // 6 - check if the user want to update the addresses feild
        // 6.1 - check if the new addresses diffrent from the old one
        // 6.2 - update the addresses
    // 7 - save the updates 
    // 8 - return the response 
*/

export const updateUser = async (req, res, next) => {
    // 1 - destructing the requierd data
    const { _id } = req.authUser;
    const {
        newUserName,
        newAge,
        newPhoneNumbers,
        newAddresses
    } = req.body;

    if (!_id) {
        return next(new Error(`signIn first please`, { cause: 400 }));
    }
    // 2 - get the user by id
    const user = await User.findById(_id);
    // 3 - check if the user want to update the name feild
    if(newUserName){
        // 3.1 - check if the new user name diffrent from the old one
        if(newUserName == user.username){
            return next(new Error('please enter diffrent user name from the existing one',{cause:400}))
        }
        // 3.2 - update the user name and slug
        user.username = newUserName;
    }
    // 4 - check if the user want to update the age feild
    if(newAge){
        // 4.1 - check if the new age diffrent from the old one
        if(newAge == user.age){
            return next(new Error('please enter diffrent age from the existing one',{cause:400}))
        }
        // 4.2 - update the age
        user.age = newAge;
    }
    // 5 - check if the user want to update the phone numbers feild
    if(newPhoneNumbers){
        // 5.1 - check if the new phone numbers diffrent from the old one
        if(user.phoneNumbers.includes(newPhoneNumbers)){
            return next(new Error('please enter diffrent phone numbers from the existing one',{cause:400}))
        }
        // 5.2 - update the phone numbers
        user.phoneNumbers = newPhoneNumbers;
    }
    // 6 - check if the user want to update the addresses feild
    if(newAddresses){
        // 6.1 - check if the new addresses diffrent from the old one
        if(user.addresses.includes(newAddresses)){
            return next(new Error('please enter diffrent addresses from the existing one',{cause:400}))
        }
        // 6.2 - update the addresses
        user.addresses = newAddresses;
    }
    // 7 - save the updates 
    await user.save();
    // 8 - return the response 
    res.status(200).json({
        success: true,
        message: 'user updated successfully',
        data: user
    })
}

// ============================ delete user profile ======================= //

/**
    // 1 - destructing the requierd data
    // 2 - get the user by id and delete him
    // 3 - return the response 
 */

export const deleteUserProfile = async (req,res,next) =>{
    // 1 - destructing the requierd data
    const { _id } = req.authUser;
    // 2 - get the user by id and delete him
    const deletedUser = await User.findByIdAndDelete(_id);
    if(!deletedUser){
        return next(new Error('user not found ', { cause: 404 }));
    }
    // 3 - return the response 
    res.status(200).json({
        success:true,
        message:'the account has been deleted'
    });
}

// =============================== get user profile data ===================== //
/*
    // 1 - destructing the requierd data
    // 2 - get the user by id
    // 3 - return the response 
*/
export const getUserProfile = async (req,res,next)=>{
    // 1 - destructing the requierd data
    const { _id } = req.authUser;
    // 2 - get the user by id
    const user = await User.findById(_id);
    if(!user){
        return next(new Error('user not found ', { cause: 404 }));
    }
    // 3 - return the response 
    res.status(200).json({
        success:true,
        data:user
    });
}