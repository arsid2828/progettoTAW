import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const ACCESS_SECRET = 'access-secret-lungo'; // o process.env.ACCESS_SECRET

export const auth = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as { id: string };
    req.user = payload;    // importante: ora tutte le route hanno req.user
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Token scaduto o invalido' });
  }
};