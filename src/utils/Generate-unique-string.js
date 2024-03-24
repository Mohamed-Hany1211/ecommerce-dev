import { customAlphabet } from "nanoid";

// len refares to the length of the unique string
const generateUniqueString = (len)=>{
    const nanoid = customAlphabet('1234567890qwertyuioasdfghjkl',len||13);
    return nanoid();
}

export default generateUniqueString;