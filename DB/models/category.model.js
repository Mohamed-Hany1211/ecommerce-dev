// modules imports
import { Schema, model } from "mongoose";

const CategroySchema = new Schema({
    name: {
        type: String, required: true, unique: true, trim: true
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
    addedBy: {   // superAdmin
        type: Schema.Types.ObjectId, ref: 'User', required: true 
    }, 
    updatedBy: {  // superAdmin
        type: Schema.Types.ObjectId, ref: 'User'
    }  

}, {
    timestamps: true,
    toJSON:{virtuals: true},
    toObject:{virtuals: true}
});

// virtual populate for subCategory model
CategroySchema.virtual('SubCategories',{
    ref:'subCategroies',
    localField: '_id',
    foreignField: 'categoryId'
})

export default model('Category', CategroySchema);