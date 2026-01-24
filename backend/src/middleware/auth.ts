// Middleware di autenticazione e gestione JWT
// Estende i tipi di Express per includere l'utente nella richiesta
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Profile } from '../models/Profile';
import { Airline } from '../models/Airline';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { _id: string; role?: string };
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'access-secret-lungo');

    // Il role è già nel token, non c'è bisogno di cercare nel DB
    req.user = { _id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: ' + (error instanceof Error ? error.message : 'Unknown error') });
  }
};