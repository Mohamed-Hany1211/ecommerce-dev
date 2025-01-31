import { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";



const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        minlength:3,
        maxlength:20,
        trim:true,
        lowercase:true
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
        minlength:6
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
    }
},{timestamps:true});

export default model('User',userSchema);