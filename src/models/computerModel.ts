import { model, Document, Schema } from 'mongoose';

interface IComputer extends Document {
  name: string;
  description?: string;
  computerType: "Desktop" | "Laptop";
  manufacturer: string; //MARCA QUE FAZ O COMPONENTE
  price: number;
  scpecifications: {
    date?: Date;
    processador?: string;
    memory?: string;
    storage?: string;
    graphics?: string;

    caseType?: string;
    powerSupply?: string;

    displaySize?: string;
    batteryLife?: string;
  };
}

const computerSchema: Schema = new Schema<IComputer>({
  name: { type: String, required: true },
  description: String,
  computerType: {
    type: String,
    enum: ["Desktop, Laptop"],
  },
  manufacturer: { type: String, required: true }, //MARCA QUE FAZ O COMPONENTE
  price: { type: Number, required: true },
  scpecifications: {
    date: Date,
    processor: String,
    memory: String,
    storage: String,
    graphics: String,
    caseType: String,
    powerSupply: String,
    displaySize: String,
    batteryLife: String,
  },
});

export const Computer = model<IComputer>("Computers", computerSchema);

