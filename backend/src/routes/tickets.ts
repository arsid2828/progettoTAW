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
            .populate({
                path: 'flight',
                populate: [
                    { path: 'from_airport' },
                    { path: 'to_airport' }
                ]
            })
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
        const { flightId, seat_pref, baggageChoice, seatTypeId, p_nome, p_cognome, seat_number } = req.body;
        const userId = req.user?._id; // Use optional chaining to handle undefined user
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        // Find the flight
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        // Determine seat type (class)
        let seatType = null;
        if (seatTypeId) {
            seatType = await SeatType.findById(seatTypeId);
        }
        if (!seatType) {
            seatType = await SeatType.findOne({ flight: flightId, seat_class: 'ECONOMY' });
        }
        if (!seatType || seatType.number_available <= 0) {
            return res.status(400).json({ message: 'No seats available for selected class' });
        }

        // Fetch profile details
        const profile = await Profile.findById(userId);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Base price from seat type
        let finalPrice = seatType.price || 0;

        // Seat preference surcharge
        const seatPrefSurcharge: Record<string, number> = { window: 15, aisle: 12, middle: 8, random: 0 };
        if (seat_pref && seatPrefSurcharge[String(seat_pref)]) finalPrice += seatPrefSurcharge[String(seat_pref)];

        // Baggage surcharge
        if (baggageChoice === 'big_cabin') finalPrice += flight.price_of_bag || 0;
        if (baggageChoice === 'big_hold') finalPrice += flight.price_of_baggage || 0;

        // Create ticket with profile details (allow overriding passenger name)
        const ticket = await Ticket.create({
            flight: flightId,
            profile: userId,
            seat_class: seatType._id,
            price_paid: finalPrice,
            p_nome: p_nome || profile.nome,
            p_cognome: p_cognome || profile.cognome,
            p_indirizzo: profile.citta_nascita,
            p_sesso: profile.sesso,
            p_code: profile.nazionalita,
            seat_number: seat_number || undefined
        });

        // Update seat availability
        seatType.number_available -= 1;
        await seatType.save();

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