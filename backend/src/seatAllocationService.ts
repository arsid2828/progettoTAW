import mongoose from 'mongoose';
import { Ticket } from './models/Ticket';
import { SeatType } from './models/SeatType';


type SeatPreference = 'window' | 'aisle' | 'middle' | 'random';

interface SeatAllocationResult {
  seatNumbers: string[];
  success: boolean;
  message?: string;
}

export class SeatAllocationService {
  private static COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Mappa delle preferenze alle colonne specifiche
  private static PREF_MAP: Record<string, string[]> = {
    window: ['A', 'F'],
    middle: ['B', 'E'],
    aisle: ['C', 'D'],
  };

  /**
   * Trova i posti migliori disponibili
   */
  public static async findBestSeats(
    ///  flightId: string | mongoose.Types.ObjectId,
    seatClassId: string | mongoose.Types.ObjectId,
    ticketsToSell: number,
    seatPref: string = 'random'
  ): Promise<SeatAllocationResult> {

    console.log(`Ricerca posti per classe ${seatClassId}, numero biglietti: ${ticketsToSell}, preferenza: ${seatPref}`);
    // 1. Recupera info sulla classe di posto (totale posti)
    const seatTypeConfig = await SeatType.findOne({
      ///    flight: flightId, 
      _id: seatClassId // O seat_class string, a seconda di come passi l'ID
    });

    if (!seatTypeConfig) {
      throw new Error('Configurazione SeatClass non trovata');
    }

    // 2. Calcola numero di righe (ogni riga ha 6 posti)
    const totalRows = Math.ceil(seatTypeConfig.number_total / 6);

    // 3. Recupera tutti i biglietti già venduti per questo volo e classe
    const soldTickets = await Ticket.find({
      ///  flight: flightId,
      seat_class: seatClassId,
    }).select('seat_number');

    // Crea un Set per accesso veloce O(1)
    const occupiedSeats = new Set(soldTickets.map(t => t.seat_number));

    //LOGICA DI ASSEGNAZIONE

    // CASO A: Passeggero Singolo (rispetta le preferenze)
    if (ticketsToSell === 1) {
      const seat = this.findSingleSeat(totalRows, occupiedSeats, seatPref);
      if (seat) return { seatNumbers: [seat], success: true };
      return { seatNumbers: [], success: false, message: 'Nessun posto disponibile con questa preferenza' };
    }

    // CASO B: Gruppo (cerca posti vicini)
    // Per i gruppi ignoriamo la preferenza specifica (window/aisle) per privilegiare la vicinanza
    const seats = this.findGroupSeats(totalRows, occupiedSeats, ticketsToSell);

    if (seats.length === ticketsToSell) {
      return { seatNumbers: seats, success: true };
    }

    return { seatNumbers: [], success: false, message: 'Non ci sono abbastanza posti disponibili' };
  }

  // --------------------------------------------
  // LOGICA INTERNA
  // -------------------------------------------

  private static findSingleSeat(
    totalRows: number,
    occupied: Set<string | undefined>,
    pref: string//SeatPreference
  ): string | null {
    const targetCols = (pref || 'random') === 'random'
      ? this.COLS
      : this.PREF_MAP[pref];

    // Scansiona riga per riga, dal davanti verso il retro
    for (let r = 1; r <= totalRows; r++) {
      for (const col of targetCols) {
        const seatNum = `${r}${col}`;
        if (!occupied.has(seatNum)) {
          return seatNum;
        }
      }
    }

    // Se la preferenza specifica non è disponibile, prova 'random' come fallback?
    // Il prompt dice "rispettare la scelta", quindi restituiamo null se non trovato.
    return null;
  }

  private static findGroupSeats(
    totalRows: number,
    occupied: Set<string | undefined>,
    count: number
  ): string[] {

    // STRATEGIA 1: Cerca una riga con 'count' posti CONSECUTIVI
    // (es. 1A, 1B, 1C per 3 persone)
    for (let r = 1; r <= totalRows; r++) {
      const rowSeats = this.COLS.map(c => `${r}${c}`);

      // Finestra scorrevole per trovare contiguità
      for (let i = 0; i <= 6 - count; i++) {
        const chunk = rowSeats.slice(i, i + count);
        if (chunk.every(s => !occupied.has(s))) {
          return chunk;
        }
      }
    }

    // STRATEGIA 2: Cerca una riga con 'count' posti LIBERI (anche non consecutivi)
    // (es. 1A, 1C, 1D per 3 persone - meglio che sparpagliati su più righe)
    for (let r = 1; r <= totalRows; r++) {
      const freeInRow: string[] = [];
      for (const col of this.COLS) {
        const seat = `${r}${col}`;
        if (!occupied.has(seat)) freeInRow.push(seat);
      }

      if (freeInRow.length >= count) {
        // Prendi i primi 'count' disponibili in questa riga
        // Cerchiamo di prendere quelli più vicini tra loro nell'array
        return freeInRow.slice(0, count);
      }
    }

    // STRATEGIA 3 (Fallback): Prendi i primi 'count' posti liberi ovunque
    // (Gruppo spaccato su più righe)
    const fallbackSeats: string[] = [];
    for (let r = 1; r <= totalRows; r++) {
      for (const col of this.COLS) {
        const seat = `${r}${col}`;
        if (!occupied.has(seat)) {
          fallbackSeats.push(seat);
          if (fallbackSeats.length === count) return fallbackSeats;
        }
      }
    }

    return fallbackSeats; // Potrebbe ritornare un array parziale se l'aereo è pienissimo
  }
}