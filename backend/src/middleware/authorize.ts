// Middleware di autorizzazione basato su ruoli
// Verifica che l'utente abbia i ruoli necessari per accedere a una risorsa
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware per verificare i permessi basati su ruolo
 * Uso: router.post('/admin-only', auth, authorize('admin'), handler)
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.user.role) {
      return res.status(403).json({ message: 'User role not found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
        console.log(`Access denied for user role: ${req.user.role}. Required roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        message: "Forbidden:" //NO troppe informazioni `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};
