import { model, Document, Schema } from 'mongoose';

export type RevokedToken = {
  token: string;
  revocationDate: Date;
} & Document

export const revokedTokenSchema = new Schema<RevokedToken>({
  token: { type: String, required: true },
  revocationDate: { type: Date, default: Date.now(), expires: '1d' },
});

export const RevokedToken = model<RevokedToken>('RevokedToken', revokedTokenSchema);
