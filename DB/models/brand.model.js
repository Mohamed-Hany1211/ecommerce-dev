import { Schema , model } from "mongoose";

// ========================= create brand schema =========================== // 
const brandSchema = new Schema({
    name: {
        type: String, required: true, trim: true
    },
    slug: {
        type: String, required: true, unique: true, trim: true
    },
    img: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true },
    },
    folderId: {
        type: String, required: true, unique: true
    },
    addedBy: {   // Admin
        type: Schema.Types.ObjectId, ref: 'User', required: true 
    }, 
    updatedBy: {  // Admin
        type: Schema.Types.ObjectId, ref: 'User'
    },
    categoryId:{
        type:Schema.Types.ObjectId, required: true, ref:'Category'
    },
    subCategoryId:{
        type:Schema.Types.ObjectId, required: true, ref:'subCategroies'
    }
},{timestamps:true})

const Brand = model('Brand',brandSchema);

export default Brand;

