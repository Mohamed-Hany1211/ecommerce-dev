import mongoose from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";
import { userStatus } from "../../src/utils/user-status.js";
import { userGender } from "../../src/utils/user-gender.js";
const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        minlength:3,
        maxlength:30,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    phoneNumbers:[{
        type:String,
        required:true
    }],
    addresses:[{
        type:String,
        required:true
    }],
    role:{
        type:String,
        enum:Object.values(systemRoles),
        default:systemRoles.USER
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    age:{
        type:Number,
        min:18,
        max:100
    },
    isloggedIn:{
        type:Boolean,
        default:false
    },
    token:String,
    ResetPasswordOTP:String,
    mediaFolderId:String,
    profilePicture:{
        secure_url:String,
        public_id:String
    },
    status:{
        type:String,
        enum:Object.values(userStatus),
        default:userStatus.OFFLINE
    },
    gender:{
        type:String,
        enum:Object.values(userGender),
        default:userGender.NOT_SPECIFIED
    }
},{timestamps:true});



export default mongoose.models.User || mongoose.model('User', userSchema);