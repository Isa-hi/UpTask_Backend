import mongoose, { Document, Schema, Types } from "mongoose";

export interface IToken extends Document {
  token: string;
  user: string;
  createdAt: Date;
}

const TokenSchema = new Schema({
  token: { type: String, required: true },
  user: { type: Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now(), expires: "10m" },
});

const Token = mongoose.model<IToken>("Token", TokenSchema);
export default Token;
