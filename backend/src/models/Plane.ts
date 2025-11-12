import mongoose from 'mongoose';
export type PlaneDoc = { model: string };
const schema = new mongoose.Schema<PlaneDoc>({
  model: { type: String, required: true }
}, { timestamps:true });
export const Plane = mongoose.model<PlaneDoc>('Plane', schema);
