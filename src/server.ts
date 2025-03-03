import app from './app';
import { config } from './config/config';
import { logger } from './middlewares/logger';
import { initDBPool } from './db/db';
import dotenv from 'dotenv';
dotenv.config();

const PORT = config.port;

initDBPool()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Error initializing the database pool:', err);
    process.exit(1);
  });