import express, { Request, Response } from 'express';
import { Profile } from '../models/Profile';  // Importa il MODELLO (non ProfileDoc)

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    // Crea un nuovo documento dal body della richiesta
    const newProfile = new Profile(req.body);
    
    // Salva nel database
    const savedProfile = await newProfile.save();
    
    // Rispondi con il profilo creato (status 201 = Created)
    res.status(201).json(savedProfile);
  } catch (error) {
    // Gestisci errori (es. validazione fallita o duplicati)
    console.error(error);
 
    // Narrow the error type
    if (error instanceof Error) {
      res.status(400).json({ message: 'Errore nella creazione del profilo', error: error.message });
    } else {
      res.status(400).json({ message: 'Errore sconosciuto nella creazione del profilo' });
    }
 
  }
});

export default router; 