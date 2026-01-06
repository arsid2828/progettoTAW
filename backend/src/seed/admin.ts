// Seed utente amministratore
// Crea l'utente admin se non esiste
import crypto from 'crypto';
import { Profile } from '../models/Profile';

export const seedAdmin = async () => {
    try {
        const email = 'admin@skyjourney.com';
        const exists = await Profile.findOne({ email });

        if (!exists) {
            console.log('Creating Admin User...');
            const password = 'admin123';
            const hashedSHA256 = crypto.createHash('sha256').update(password).digest('hex');

            await Profile.create({
                email,
                password: hashedSHA256,
                nome: 'Admin',
                cognome: 'System',
                sesso: 0,
                data_nascita: new Date('1970-01-01'),
                citta_nascita: 'System',
                role: 'admin'
            });
            console.log('Admin user created: admin@skyjourney.com / admin123');
        } else {
            // Assicura che il ruolo sia admin se esiste (nel caso sia stato creato prima dell'aggiornamento schema)
            if (exists.role !== 'admin') {
                exists.role = 'admin';
                await exists.save();
                console.log('Admin role updated for existing user');
            } else {
                console.log('Admin user already exists.');
            }
        }
    } catch (error) {
        console.error('Errore seed admin:', error);
    }
};
