import { Schema } from "mongoose";

export type IGpuSpecifications = {
    name?: string;
    memory?: number;
    type?: string;
}

const gpuSpecificationSchema = new Schema<IGpuSpecifications>({
    name: { type: String, required: true },
    memory: { type: Number, required: true },
    type: { type: String, required: true }
});

export default gpuSpecificationSchema;