import mongoose from 'mongoose';
export type ProfileDoc = {
  email: string;
  password: string; // hashed
  nome: string;
  cognome: string;
  sesso: number; // 0=M,1=F (come nel BD)
  telefono?: string;
  nazionalita?: string;
  data_nascita: Date;
  citta_nascita: string;
  role?: string;
};
const schema = new mongoose.Schema<ProfileDoc>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  sesso: { type: Number, required: true, enum: [0, 1] },
  telefono: String,
  nazionalita: String,
  data_nascita: { type: Date, required: true },
  citta_nascita: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });
export const Profile = mongoose.model<ProfileDoc>('Profile', schema);
