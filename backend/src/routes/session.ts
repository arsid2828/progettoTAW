import express from 'express';
import crypto from 'crypto';
import { Profile } from '../models/Profile';
import { Session } from '../models/session';

const router = express.Router();

// 1. LOGIN → crea sessione e restituisce token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await Profile.findOne({ email });
  if (!user || user.password !== crypto.createHash('sha256').update(password).digest('hex')) {
    return res.status(401).json({ message: 'Credenziali errate' });
  }

  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 giorni

  await Session.create({
    userId: user._id,
    token,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({ token });
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
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    await Session.updateOne({ token }, { isActive: false });
  }
  res.json({ message: 'Logout ok' });
});

export default router;