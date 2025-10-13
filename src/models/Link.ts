// url-shortener-api/src/models/Link.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILink extends Document {
  slug: string;
  url: string;
  createdAt: Date;
  visitCount: number;
}

const LinkSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 0 },
});

export default mongoose.model<ILink>('Link', LinkSchema);