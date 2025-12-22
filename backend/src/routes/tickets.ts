import express, { Request } from 'express';
import { Airport } from '../models/Airport';
import { auth } from '../middleware/auth';
import { Flight } from '../models/Flight';
import { SeatType } from '../models/SeatType';
import { Ticket } from '../models/Ticket';
import { Profile } from '../models/Profile';

const router = express.Router();

// Add your ticket routes here
router.get('/', auth, async (req, res) => {
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
        console.log('BODY RICEVUTO NELLA ROUTE TICKETS:', req.body);
        const { flightId, passengers, seatTypeId } = req.body;
        const userId = req.user?._id; // Use optional chaining to handle undefined user
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        // Find the flight
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        // Parse passengers
        let passengersArray = [];
        console.log('sPassengers:', passengers);
        if (passengers) {
            try {
                passengersArray = JSON.parse(passengers);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid passengers data' });
            }
        }
        let tickets = [];
        console.log('PASSEGGERI:', passengersArray);
        for (const passenger of passengersArray) {
            console.log('ELABORAZIONE PASSEGGERO:', passenger);
            const { nome, cognome, seat_number, baggageChoice, seat_pref } = passenger;
            // Determine seat type (class) - prefer per-passenger selection
            const passengerSeatTypeId = passenger && (passenger.seatTypeId || passenger.seat_type || passenger.seat_class);
            let seatType = null;
            if (passengerSeatTypeId) {
                try { seatType = await SeatType.findById(passengerSeatTypeId); } catch { }
            }
            if (!seatType && seatTypeId) {
                try { seatType = await SeatType.findById(seatTypeId); } catch { }
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


            console.log('PRIMA ', {
                flight: flightId,
                profile: userId,
                seat_class: seatType,
                price_paid: finalPrice,
                p_nome: nome,
                p_cognome: cognome,
                bagage_choice: baggageChoice,
                seat_number: seat_number || undefined
            });  // Create ticket with profile details (allow overriding passenger name)
            const ticket = await Ticket.create({
                flight: flightId,
                profile: userId,
                seat_class: seatType,
                price_paid: finalPrice,
                p_nome: nome,
                p_cognome: cognome,
                bagage_choice: baggageChoice,
                seat_number: seat_number || undefined
            });
            // Update seat availability
            seatType.number_available -= 1;
            await seatType.save();
            console.log('DOPO ', ticket);
            tickets.push(ticket);

        }
        res.status(201).json({ message: 'Ticket booked successfully', tickets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;

