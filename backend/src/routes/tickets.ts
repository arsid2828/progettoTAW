import express, { Request } from 'express';
import { Airport } from '../models/Airport';
import { auth } from '../middleware/auth';
import { Flight } from '../models/Flight';
import { SeatType } from '../models/SeatType';
import { Ticket } from '../models/Ticket';
import { Profile } from '../models/Profile';

const router = express.Router();

// Add your ticket routes here
router.get('/',auth, async (req, res) => {
     try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        // Recupera tutti i biglietti dell'utente
        const tickets = await Ticket.find({ profile: userId })
            .populate('flight')
            .populate('seat_class')
            .populate('profile');

        res.status(200).json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Add your ticket routes here
router.post('/', auth, async (req, res) => {
    try {
        const { flightId } = req.body;
        const userId = req.user?._id; // Use optional chaining to handle undefined user
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        // Find the flight
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        // Find economy seat type for the flight
        const economySeat = await SeatType.findOne({ flight: flightId, seat_class: 'ECONOMY' });
        if (!economySeat || economySeat.number_available <= 0) {
            return res.status(400).json({ message: 'No economy seats available' });
        }

        // Fetch profile details
        const profile = await Profile.findById(userId);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Create ticket with profile details
        const ticket = await Ticket.create({
            flight: flightId,
            profile: userId,
            seat_class: economySeat._id,
            price_paid: economySeat.price,
            p_nome: profile.nome,
            p_cognome: profile.cognome,
            p_indirizzo: profile.citta_nascita,
            p_sesso: profile.sesso,
            p_code: profile.nazionalita //TODO da cambiare con codice fiscale
        });

        // Update seat availability
        economySeat.number_available -= 1;
        await economySeat.save();

        res.status(201).json({ message: 'Ticket booked successfully', ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;

declare module 'express-serve-static-core' {
  interface Request {
    user?: { _id: string };
  }
}