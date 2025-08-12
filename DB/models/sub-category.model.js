// modules imports
import { Schema, model } from "mongoose";

const SubCategroySchema = new Schema({
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
    },
    categoryId: {
        type: Schema.Types.ObjectId, required: true, ref: 'Category'
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// brands virtual populate
SubCategroySchema.virtual('Brands', {
    ref: 'Brands',
    localField: '_id',
    foreignField: 'subCategoryId'
})

const subCategroies = model('subCategroies', SubCategroySchema)

export default subCategroies;