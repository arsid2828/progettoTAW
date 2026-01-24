// Gestione profilo utente
// API per gestire profili utente, registrazione e operazioni admin
import express, { Request, Response } from 'express';
import { Profile } from '../models/Profile';  // Importa il MODELLO (non ProfileDoc)
import crypto from 'crypto';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

const hashPassword = (password: string) =>
  crypto.createHash('sha256').update(password).digest('hex');

router.post('/', async (req: Request, res: Response) => {
  try {
    // Crea un nuovo documento dal body della richiesta
    const newProfile = new Profile(req.body);
    if (newProfile.data_nascita >= new Date()) {
      return res.status(400).json({ message: 'La data di nascita deve essere nel passato' });
    }

    newProfile.password = hashPassword(newProfile.password);

    // Salva nel database
    const savedProfile = await newProfile.save();
    newProfile.password = "<segreto>";

    // Rispondi con il profilo creato (status 201 = Creato)
    res.status(201).json(savedProfile);
  } catch (error) {
    // Gestisci errori
    console.error(error);

    // Restringi il tipo di errore
    if (error instanceof Error) {
      res.status(400).json({ message: 'Errore nella creazione del profilo', error: error.message });
    } else {
      res.status(400).json({ message: 'Errore sconosciuto nella creazione del profilo' });
    }

  }
});

// Admin: Ottieni tutti i profili
router.get('/', auth, authorize('admin'), async (req: Request, res: Response) => {
  const profiles = await Profile.find({ role: { $ne: 'admin' } }).select('-password');
  res.json(profiles);
});

// Admin: Elimina profilo
router.delete('/:id', auth, authorize('admin'), async (req: Request, res: Response) => {
  try {
    await Profile.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Ritorna profilo loggato corrente
router.get('/me', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const profile = await Profile.findById(userId).select('-password');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 