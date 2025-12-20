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

export default router;
