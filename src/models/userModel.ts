import { model, Document, Schema } from 'mongoose';
import { CartItem } from './cartModel';

export enum UserRole {
  Admin = 'admin',
  Security = 'security',
  Manager = 'manager',
  Member = 'member',
  NonMember = 'nonmember',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  picture: string;
  age: number;
  address: string;
  country: string;
  verifyAccountToken: string | null;
  verifyAccountTokenExpires: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  isVerified: boolean | false;
  lastLoginIP: string;
  cart: CartItem[] | null
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      default: UserRole.Member,
      enum: Object.values(UserRole),
    },
    picture: { type: String, default: null },
    age: { type: Number, default: null },
    address: { type: String, default: null },
    country: { type: String, default: null },
    verifyAccountToken: { type: String, default: null },
    verifyAccountTokenExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    lastLoginIP: { type: String, default: null },
    cart: [{ type: Schema.Types.ObjectId, ref: 'CartItem' }],
  },
  {
    timestamps: true,
  },
);

export const User = model<IUser>('User', UserSchema);
