import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';
import { DoctorService } from '../services/DoctorService';
import { DoctorRepository } from '../repositories/DoctorRepository';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateMiddleware } from '../middlewares/validateMiddleware';
import Joi from 'joi';

const router = Router();

const doctorRepo = new DoctorRepository();
const doctorService = new DoctorService(doctorRepo);
const doctorController = new DoctorController(doctorService);

const createDoctorSchema = Joi.object({
  userId: Joi.number().required(),
  specialty: Joi.string().required(),
});


router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']), 
  validateMiddleware(createDoctorSchema),
  doctorController.createDoctor
);


router.get(
  '/:doctorId',
  authMiddleware,
  roleMiddleware(['admin', 'doctor', 'patient']),
  doctorController.getDoctor
);

export default router;
