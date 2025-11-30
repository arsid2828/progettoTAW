import express, { Request, Response } from 'express';
import { Profile } from '../models/Profile';  // Importa il MODELLO (non ProfileDoc)
import crypto from 'crypto';

const router = express.Router();

const hashPassword = (password: string) => 
  crypto.createHash('sha256').update(password).digest('hex');

router.post('/', async (req: Request, res: Response) => {
  try {
    // Crea un nuovo documento dal body della richiesta
    const newProfile = new Profile(req.body);
    if(newProfile.data_nascita>=new Date()){
      return res.status(400).json({ message: 'La data di nascita deve essere nel passato' });
    }

    newProfile.password = hashPassword(newProfile.password);
    // Salva nel database
    const savedProfile = await newProfile.save();
    newProfile.password = "<segreto>";
    
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