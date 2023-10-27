import mongoose, { Document, Schema, model } from "mongoose";

export interface ISubcategory extends Document {
    name: string; //adicionar array enum
    product: mongoose.Types.ObjectId;
}

const subcaregorySchema = new Schema<ISubcategory>({
    name: { type: String, required: true  },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
})

export const Subcategory = model<ISubcategory>("Subcategory", subcaregorySchema);


