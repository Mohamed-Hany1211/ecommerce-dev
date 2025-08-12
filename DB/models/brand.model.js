import mongoose from "mongoose";

// ========================= create brand schema =========================== // 
const brandSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true 
    }, 
    updatedBy: {  // Admin
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId, required: true, ref:'Category'
    },
    subCategoryId:{
        type: mongoose.Schema.Types.ObjectId, required: true, ref:'subCategroies'
    }
},{timestamps:true})

export default mongoose.models.Brands || mongoose.model('Brands',brandSchema);

