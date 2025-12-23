// Gestione compagnie aeree
// API admin per gestire le compagnie aeree
import express from 'express';
import bcrypt from 'bcrypt';
import { Airline } from '../models/Airline';
import { auth } from '../middleware/auth';

const router = express.Router();

// Ottieni tutte le compagnie
router.get('/', auth, async (req: any, res: any) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        const airlines = await Airline.find().select('-password');
        res.json(airlines);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching airlines' });
    }
});

// Crea compagnia
router.post('/', auth, async (req: any, res: any) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

        const exists = await Airline.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAirline = await Airline.create({
            name,
            email,
            password: hashedPassword,
            role: 'airline',
            mustChangePassword: true
        });

        res.status(201).json({ message: 'Airline created', airline: newAirline });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating airline' });
    }
});

export default router;
