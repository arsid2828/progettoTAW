import express, { Request, Response } from 'express';
import { Plane } from '../models/Plane';

const router = express.Router();

// GET /api/planes - List all planes
router.get('/', async (req: Request, res: Response) => {
    try {
        const planes = await Plane.find();
        res.json(planes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/planes - Add new plane
router.post('/', async (req: Request, res: Response) => {
    try {
        const { brand, model, registration } = req.body;
        if (!brand || !model || !registration) {
            return res.status(400).json({ message: 'Brand, model and registration are required' });
        }

        const existing = await Plane.findOne({ registration });
        if (existing) {
            return res.status(400).json({ message: 'Registration already exists' });
        }

        const newPlane = await Plane.create({ brand, model, registration });
        res.status(201).json(newPlane);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
