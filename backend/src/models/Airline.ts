import mongoose from 'mongoose';
export type AirlineDoc = {
  name: string;
  email: string;
  password: string; // hashed
};
const schema = new mongoose.Schema<AirlineDoc>({
  name:     { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps:true });
export const Airline = mongoose.model<AirlineDoc>('Airline', schema);
