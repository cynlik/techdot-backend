import mongoose, { Document, Schema, model } from 'mongoose' ;

export interface IProduct extends Document {
name: string;
description: string;
imageUrl: string;
manufacturer: string;
stockQuantity: number;
price: number;
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String, required: true } ,
    imageUrl: { type: String, required: true, unique: true},
    manufacturer: { type: String, required: true},
    stockQuantity: { type: Number, required: true, min: 0},
    price: { type: Number, required: true, min: 0 },
});

export const Product = model<IProduct>('Product', productSchema);