import express from 'express';
import crypto from 'crypto';
import { Profile } from '../models/Profile';
import { Airline } from '../models/Airline';
import { Session } from '../models/session';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { redis } from '../redis';

const router = express.Router();
const ACCESS_SECRET = 'access-secret-lungo';
const REFRESH_SECRET = 'refresh-secret-ancora-piu-lungo';
// 1. LOGIN → crea sessione e restituisce token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Tentativo di login per email:', email);
    // 1. Cerca in Profile
    let user: any = await Profile.findOne({ email });
    let userModelType = 'Profile';

    // 2. Se non trovato, cerca in Airline
    if (!user) {
        user = await Airline.findOne({ email });
        userModelType = 'Airline';
    }

    if (!user) {
        return res.status(401).json({ message: 'Credenziali errate (Utente non trovato)' });
    }

    // 3. Verifica password
    let isValidByHash = false;
    let isValidByBcrypt = false;

    // Tentativo 1: SHA256 (Vecchio sistema Profile)
    const hashedSHA256 = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password === hashedSHA256) {
        isValidByHash = true;
    }
    console.log('isValidByHash:', isValidByHash);
    // Tentativo 2: BCrypt (Nuovo sistema Airline)
    // Nota: bcrypt.compare funziona solo se la psw nel DB è un hash bcrypt valido.
    // Se è uno SHA256, bcrypt.compare darà false o errore, quindi lo gestiamo in try/catch o fidandoci del tipo.
    // Per sicurezza, se è Profile usiamo SHA256 (come sopra), se è Airline usiamo bcrypt.
    if (userModelType === 'Airline') {
        isValidByBcrypt = await bcrypt.compare(password, user.password);
    }

    // Combinazione check
    // Se è Profile -> deve matchare SHA256
    // Se è Airline -> deve matchare Bcrypt
    // O più genericamente: se uno dei due match è valido e coerente col tipo.

    let isAuthenticated = false;
    if (userModelType === 'Profile' && isValidByHash) isAuthenticated = true;
    if (userModelType === 'Airline' && isValidByBcrypt) isAuthenticated = true;

    if (!isAuthenticated) {
        return res.status(401).json({ message: 'Credenziali errate' });
    }

    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 giorni

    console.log(`Utente ${userModelType} autenticato con successo:`, user.email);

    const userId = user._id.toString();

    // Access token 15 min
    const accessToken = jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: '1m' }); //15m TODO

    // Refresh token 30 giorni + salvato in Redis
    const refreshToken = randomUUID();
    await redis.set(`rt:${refreshToken}`, userId, 'EX', 30 * 24 * 60 * 60);
    console.log('Refresh token salvato in Redis per userId:', userId);
    // Crea sessione su DB
    await Session.create({
        userId: user._id,
        userModel: userModelType, // 'Profile' o 'Airline'
        accessToken,
        refreshToken,
        expiresAt,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
    });
    console.log('Sessione creata per utente:', user.email);
    res.json({ accessToken, refreshToken });

});
// REFRESH
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ msg: 'No refresh' });

    const userId = await redis.get(`rt:${refreshToken}`);
    if (!userId) return res.status(401).json({ msg: 'Invalid refresh' });

    const accessToken = jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: '1m' }); //15m TODO
    res.json({ accessToken });
});
// 2. ME → restituisce dati utente loggato
router.get('/me', async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) return res.status(401).json({ message: 'Token mancante' });

    const session = await Session.findOne({ accessToken, isActive: true })
        .populate('userId', 'nome cognome email name');

    if (!session) return res.status(401).json({ message: 'Sessione non valida' });

    res.json(session.userId);
});

// 3. LOGOUT → invalida il token
/*router.post('/logout', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        await Session.updateOne({ token }, { isActive: false });
    }
    res.json({ message: 'Logout ok' });
});*/
// LOGOUT (globale e immediato)
router.post('/logout', async (req, res) => {
    console.log('BODY RICEVUTO:', req.body);
    const { refreshToken } = req.body;
    console.log('refreshToken RICEVUTO:', refreshToken); let deleted = 0;
    if (refreshToken) {
        deleted = await redis.del(`rt:${refreshToken}`); // ← 1 se esiste, 0 se no
    }

    res.json({
        msg: 'Logout eseguito',
        tokenEliminato: !!deleted,
        numeroChiaviCancellate: deleted   // sarà 0 o 1
    });
});

export default router;