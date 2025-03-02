import { Request, Response, NextFunction } from 'express';

export function roleMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user; 
    if (!user) {
     res.status(401).json({ error: 'Not authenticated' });
    
    }
    if (!allowedRoles.includes(user.role)) {
       res.status(403).json({ error: 'Access denied' });

    }
    next();
  };
}
