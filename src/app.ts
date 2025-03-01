import express from 'express';
import appoitmentRoutes from './routes/appointmentRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes

app.use('/api/appointments', appoitmentRoutes);

app.use(errorHandler);

export default app;