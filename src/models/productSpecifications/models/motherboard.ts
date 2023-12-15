import mongoose, { Document, Schema, model } from "mongoose";

export type IMotherboardSpecifications = {
    manufacturer?: string;
    chipset?: string;
    formFactor?: string;
}

const motherboardSpecificationSchema = new Schema<IMotherboardSpecifications>({
    manufacturer: { type: String, required: true },
    chipset: { type: String, required: true },
    formFactor: { type: String, required: true }
});

export default motherboardSpecificationSchema;