// Seed aerei
// Popola il DB con aerei di esempio
import { Plane, PlaneDoc } from '../models/Plane';

const samplePlanes: PlaneDoc[] = [
  {
    brand: 'Boeing',
    model: '737-800',
    registration: 'EI-DCL' // Targa Ryanair tipica
  },
  {
    brand: 'Airbus',
    model: 'A320-200',
    registration: 'I-BIXI' // Targa Alitalia/ITA style
  },
  {
    brand: 'Boeing',
    model: '787-9 Dreamliner',
    registration: 'N885AR' // Targa Americana
  },
  {
    brand: 'Airbus',
    model: 'A380-800',
    registration: 'A6-EEO' // Targa Emirates style
  },
  {
    brand: 'Embraer',
    model: 'E190',
    registration: 'D-AECG' // Targa Tedesca
  },
  {
    brand: 'Airbus',
    model: 'A350-900',
    registration: 'F-HTYA' // Targa Francese
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