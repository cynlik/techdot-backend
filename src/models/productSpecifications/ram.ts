import { Schema } from "mongoose";

interface IRamSpecifications {
    size?: number;
    frequency?: number;
    type?: string;
}

const ramSpecificationSchema = new Schema<IRamSpecifications>({
    size: { type: Number, required: true },
    frequency: { type: Number, required: true },
    type: { type: String, required: true }
});

export default ramSpecificationSchema;