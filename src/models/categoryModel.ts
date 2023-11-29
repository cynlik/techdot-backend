import { Document, Schema, model } from 'mongoose' ;

export interface ICategory extends Document {
    name: string;
    visible: boolean;
}

const categorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true },
    visible: { type: Boolean, required: true, default: false}
},
{
    timestamps: true
});

export const Category = model<ICategory>('Category', categorySchema);