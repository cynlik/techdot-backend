import { Schema } from 'mongoose';

interface Component {
  name: string;
  description: string;
  componentType: ComponentType;
  manufacturer: string; //MARCA QUE FAZ O COMPONENTE
  price: number;
  specifications: {
    // estas abaixo sao opcionais
    date: Date;
    socketType: string;
    graphicsType: string;
    capacity: string;
    watts: string;
    speed: string; //in MhZ Ghz IOPS MB/s
  };
}

interface ComponentType {
  name: 'CPU' | 'PSU' | 'GPU' | 'MOTHERBOARD' | 'RAM' | 'SSD' | 'HDD';
}

// Define a schema for component types
// CPU, PSU, GPU, MB e RAM
const componentType = new Schema<ComponentType>({
  name: {
    type: String,
    enum: ['CPU', 'PSU', 'GPU', 'MOTHERBOARD', 'RAM', 'SSD', 'HDD'],
  },
});

// Define a schema for PC components
const componentSchema = new Schema<Component>({
  name: { type: String, required: true },
  description: String,
  componentType: {
    //usar isto para filtrar entre os diferentes componentes nas queries no menu
    type: Schema.Types.ObjectId,
    ref: 'ComponentType',
  },
  manufacturer: { type: String, required: true }, //MARCA QUE FAZ O COMPONENTE
  price: { type: Number, required: true },
  specifications: {
		date: Date,
    // estas abaixo sao opcionais
    socketType: String,
    graphicsType: String,
    capacity: String,
    watts: String,
    speed: String, //in MhZ Ghz IOPS MB/s
  },
  //image: String, //a ser adicionado futuramente
});

const ComponentType = mongoose.model('ComponentType', componentType);
const Component = mongoose.model('Component', componentSchema);

module.exports = {
  ComponentType,
  Component,
};
