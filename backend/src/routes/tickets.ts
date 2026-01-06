// Gestione biglietti
// Gestisce API per visualizzare e acquistare biglietti
import express, { Request } from 'express';
import { Airport } from '../models/Airport';
import { auth } from '../middleware/auth';
import { Flight } from '../models/Flight';
import { SeatType } from '../models/SeatType';
import { Ticket } from '../models/Ticket';
import { Profile } from '../models/Profile';
import { SeatAllocationService } from '../seatAllocationService';

const router = express.Router();

// Aggiungi qui le rotte biglietti
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        // Recupera tutti i biglietti dell'utente
        console.log('GET /tickets request for user:', userId);
        const tickets = await Ticket.find({ profile: userId })
            .populate({
                path: 'flight',
                populate: [
                    { path: 'from_airport' },
                    { path: 'to_airport' },
                    { path: 'airline' }
                ]
            })
            .populate('seat_class')
            .populate('profile');

        console.log(`Found ${tickets.length} tickets for user ${userId}`);

        res.status(200).json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Aggiungi qui le rotte biglietti
router.post('/', auth, async (req, res) => {
    try {
        console.log('BODY RICEVUTO NELLA ROUTE TICKETS:', req.body);
        const { flightId, passengers, seatTypeId } = req.body;
        const userId = req.user?._id; // Use optional chaining to handle undefined user
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        // Trova il volo
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        // Parsing passeggeri
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
        let seat_pref='random';
        if (passengersArray.length == 1 && passengersArray[0].seat_pref) {
            seat_pref = passengersArray[0].seat_pref;
        }
        const allocation = await SeatAllocationService.findBestSeats(
            ///flightId,
            passengersArray[0].seatTypeId,
            passengersArray.length,
            seat_pref// 'window', 'aisle', etc. (usato solo se numTickets == 1)
        );

        if (!allocation.success) {
            return res.status(400).json({ error: allocation.message });
        }
        let cc=0;
        for (const passenger of passengersArray) {
            console.log('ELABORAZIONE PASSEGGERO:', passenger);
            console.log('passenger.baggageChoice:', passenger.baggageChoice);
            console.log('passenger.bag_label:', passenger.bag_label);
            let { nome, cognome, /*seat_number,*/ baggageChoice, seat_pref, bag_label } = passenger;
            let seatNumber = allocation.seatNumbers[cc];
            cc++;
            console.log('Assegnazione posto:', seatNumber);
            let seat_number = seatNumber; // Sovrascrivi con il posto assegnato
            console.log('baggageChoice:', passenger.baggageChoice);
            console.log('bag_label:', passenger.bag_label);
            baggageChoice = baggageChoice || bag_label;
            // Determina tipo posto (classe) - preferenza per passeggero
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

            // Recupera dettagli profilo (Opzionale per validazione, ma il middleware auth garantisce già che l'utente esiste)
            // Se l'utente è un Admin o Airline, potrebbe non avere un documento "Profile"
            // Quindi rimuoviamo il blocco bloccante per "Profile not found" a meno che non sia strettamente necessario per logica business

            // const profile = await Profile.findById(userId);
            // if (!profile) {
            //    // return res.status(404).json({ message: 'Profile not found' });
            // }

            // Prezzo base dal tipo di posto
            let finalPrice = seatType.price || 0;

            // Seat preference surcharge
            const seatPrefSurcharge: Record<string, number> = { window: 15, aisle: 12, middle: 8, random: 0 };
            if (seat_pref && seatPrefSurcharge[String(seat_pref)]) finalPrice += seatPrefSurcharge[String(seat_pref)];

            // Supplemento bagaglio
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
            });  // Crea biglietto con dettagli profilo (permette di sovrascrivere il nome passeggero)
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
            // Aggiorna disponibilità posti
            seatType.number_available -= 1;
            await seatType.save();
            console.log('Ticket creato con successo:', ticket._id, 'per volo:', flightId);
            tickets.push(ticket);
        }
        res.status(201).json({ message: 'Ticket booked successfully', tickets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;

