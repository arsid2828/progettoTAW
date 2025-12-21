import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Profile } from '../models/Profile';
import { Airline } from '../models/Airline';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'access-secret-lungo');

    let user: any = await Profile.findById(decoded.id);
    if (!user) {
      user = await Airline.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { _id: user._id.toString() };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized!!!!' + (error instanceof Error ? ': ' + error.message : '') });
  }
};