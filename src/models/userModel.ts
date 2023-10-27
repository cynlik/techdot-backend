import { model, Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'manage-products' | 'manage-clients' | 'member' | 'nonmember';
  age: number;
  address: string;
  country: string;
};

export const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    default: 'member',
    enum: ['manage-products', 'manage-clients', 'member', 'nonmember'],
  },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
});

export const User = model<IUser>('User', UserSchema);
