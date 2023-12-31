import { Schema } from "mongoose";

export type ICaseSpecifications = {
    length?: number;
    width?: number;
    height?: number;
    material?: string;
}

const caseSpecificationSchema = new Schema<ICaseSpecifications>({
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    material: { type: String, required: true }
});

export default caseSpecificationSchema;