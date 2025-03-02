import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export function validateMiddleware(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
   
    const { error, value } = schema.validate(req.body, { stripUnknown: true });
    if (error) {
      res.status(400).json({ error: error.details.map(d => d.message).join(', ') });
      return;
    }
    req.body = value;
    next();
  };
}
