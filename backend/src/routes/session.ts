import express from 'express';
import crypto from 'crypto';
import { Profile } from '../models/Profile';
import { Session } from '../models/session';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { redis } from '../redis';

const router = express.Router();
const ACCESS_SECRET = 'access-secret-lungo';
const REFRESH_SECRET = 'refresh-secret-ancora-piu-lungo';
// 1. LOGIN → crea sessione e restituisce token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await Profile.findOne({ email });
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (!user || user.password !== hashedPassword) {
        return res.status(401).json({ message: 'Credenziali errate db='+(user?user.password:'')+" ric"+hashedPassword });
    }

    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 giorni



    const userId = user._id.toString();

    // Access token 15 min
    const accessToken = jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: '1m' }); //15m TODO

    // Refresh token 30 giorni + salvato in Redis
    const refreshToken = randomUUID();
    await redis.set(`rt:${refreshToken}`, userId, 'EX', 30 * 24 * 60 * 60);

    /*await Session.create({
        userId: user._id,
        accessToken,
        refreshToken
    expiresAt,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
    });*/

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
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token mancante' });

    const session = await Session.findOne({ token, isActive: true })
        .populate('userId', 'nome cognome email');

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
    console.log('refreshToken RICEVUTO:', refreshToken);let deleted = 0;
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