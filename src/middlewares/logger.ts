// src/middlewares/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    // You can add a file transport if desired:
    // new winston.transports.File({ filename: 'app.log' })
  ],
});
