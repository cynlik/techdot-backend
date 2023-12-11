import { model, Document, Schema } from 'mongoose'

export interface RevokedToken extends Document {
  token: string
  revocationDate: Date
}

export const revokedTokenSchema = new Schema<RevokedToken>({
  token: { type: String, required: true },
  revocationDate: { type: Date, default: Date.now(), expires: '1d' },
})

export const RevokedToken = model<RevokedToken>('RevokedToken', revokedTokenSchema)
