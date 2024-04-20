import {Schema,model} from 'mongoose';

const productSchema = new Schema({
    // strings
    title:{ type: String , required: true , trim: true },
    description : String,
    slug:{ type: String , required: true },
    folderId:{ type: String , required: true , unique: true },

    // numbers 
    basePrice:{ type: Number , required: true },
    discount:{ type: Number , default: 0 },
    appliedPrice:{ type: Number , required: true },
    stock:{ type: Number , required: true , min: 0 , default: 0 },
    rate:{ type: Number , default: 0 , min: 0 , max: 5},

    // objectIds
    addedBy:{type: Schema.Types.ObjectId , ref:'User' , required: true},
    updatedBy:{type: Schema.Types.ObjectId , ref:'User' },
    brandId:{type: Schema.Types.ObjectId , ref:'Brand' ,required:true},
    categoryId:{type: Schema.Types.ObjectId , ref:'Category' , required: true},
    subCategoryId:{type: Schema.Types.ObjectId , ref:'subCategroies' , required: true},
    // arrays
    imgs:[
        {
            secure_url: { type: String, required: true },
            public_id: { type: String, required: true, unique: true },
        }
    ],
    specifications:{
        type: Map,
        of:[String|Number]
    }
},{timestamps:true});

export default model('Product', productSchema);