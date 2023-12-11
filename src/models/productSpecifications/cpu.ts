import { Schema } from "mongoose";

export interface ICpuSpecifications {
    brand?: string;
    speed?: number;
    cores?: number;
}

const cpuSpecificationsSchema = new Schema<ICpuSpecifications>({
    brand: { type: String, required: true },
    speed: { type: Number, required: true },
    cores: { type: Number, required: true }
});

export default cpuSpecificationsSchema;