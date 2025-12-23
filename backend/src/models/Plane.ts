// Modello degli aerei
// Gestisce i dettagli tecnici dei velivoli
import mongoose from 'mongoose';

export type PlaneDoc = {
  brand: string;        // Marca (es. Boeing)
  model: string;        // Modello (es. 737-800)
  registration: string; // Targa (es. I-BIXI) - Univoca
};

const schema = new mongoose.Schema<PlaneDoc>({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  registration: { type: String, required: true, unique: true } // La targa non può essere duplicata
}, { timestamps: true });

export const Plane = mongoose.model<PlaneDoc>('Plane', schema);