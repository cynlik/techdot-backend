import { model, Document, Schema } from 'mongoose';
import { UserRole } from '@src/utility/roles';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
  age: number;
  address: string;
  country: string;
}

export const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: {
    type: [String],
    required: true,
    default: [UserRole.Member],
    enum: Object.values(UserRole),
  },
  age: { type: Number, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
});

export const User = model<IUser>('User', UserSchema);
