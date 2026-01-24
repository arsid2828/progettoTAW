// Seed aerei
// Popola il DB con aerei di esempio
import { Plane, PlaneDoc } from '../models/Plane';

const samplePlanes: PlaneDoc[] = [
  {
    brand: 'Boeing',
    model: '737-800',
    registration: 'EI-DCL'
  },
  {
    brand: 'Airbus',
    model: 'A320-200',
    registration: 'I-BIXI'
  },
  {
    brand: 'Boeing',
    model: '787-9 Dreamliner',
    registration: 'N885AR'
  },
  {
    brand: 'Airbus',
    model: 'A380-800',
    registration: 'A6-EEO'
  },
  {
    brand: 'Embraer',
    model: 'E190',
    registration: 'D-AECG'
  },
  {
    brand: 'Airbus',
    model: 'A350-900',
    registration: 'F-HTYA'
  }
];

export const seedPlanes = async () => {
  try {
    const count = await Plane.countDocuments();

    if (count === 0) {
      console.log('Avvio seeding Aerei (con targhe)...');
      await Plane.insertMany(samplePlanes);
      console.log(`${samplePlanes.length} aerei caricati con successo!`);
    } else {
      console.log('Aerei già presenti. Salto.');
    }
  } catch (error) {
    console.error('Errore seed Planes:', error);
  }
};