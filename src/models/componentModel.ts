import { Document, Schema, model } from 'mongoose';

interface IComponent extends Document {
  name: string;
  description?: string;
  componentType: 'CPU' | 'PSU' | 'GPU' | 'MOTHERBOARD' | 'RAM' | 'SSD' | 'HDD';
  manufacturer: string; //MARCA QUE FAZ O COMPONENTE
  price: number;
  specifications: {
    // estas abaixo sao opcionais
    date?: Date;
    socketType?: string;
    graphicsType?: string;
    capacity?: string;
    watts?: string;
    speed?: string; //in MhZ Ghz IOPS MB/s
  };
}

// Define a schema for PC components
const componentSchema = new Schema<IComponent>({
  name: { type: String, required: true },
  description: String,
  componentType: {
    type: String,
    enum: ['CPU', 'PSU', 'GPU', 'MOTHERBOARD', 'RAM', 'SSD', 'HDD'],
  },
  manufacturer: { type: String, required: true }, //MARCA QUE FAZ O COMPONENTE
  price: { type: Number, required: true },
  specifications: {
    // estas abaixo sao opcionais
    date: Date,
    socketType: String,
    graphicsType: String,
    capacity: String,
    watts: String,
    speed: String, //in MhZ Ghz IOPS MB/s
  },
  //image: String, //a ser adicionado futuramente
});

export const Component = model<IComponent>('Component', componentSchema);
