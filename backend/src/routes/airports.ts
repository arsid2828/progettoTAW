//Gestione aeroporti
//API per listare e creare aeroporti
import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Airport } from '../models/Airport';

const router = express.Router();

// GET /api/airports - Lista tutti gli aeroporti
router.get('/', async (req: Request, res: Response) => {
    try {
        const airports = await Airport.find().sort({ name: 1 });
        res.json(airports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//POST /api/airports - Aggiunge nuovo aeroporto
router.post('/', auth, authorize('airline'), async (req: Request, res: Response) => {
    try {
        const { name, city, code } = req.body;
        if (!name || !city || !code) {
            return res.status(400).json({ message: 'Name, city and code are required' });
        }
        const exists = await Airport.findOne({ code });
        if (exists) {
            return res.status(400).json({ message: 'Airport code already exists' });
        }

        const newAirport = await Airport.create({ name, city, code });
        res.status(201).json(newAirport);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
