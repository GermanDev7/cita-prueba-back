import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { AppointmentService } from '../services/AppointmentService';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { DoctorRepository } from '../repositories/DoctorRepository';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { validateMiddleware } from '../middlewares/validateMiddleware';
import Joi from 'joi';

const router = Router();

const appointmentRepo = new AppointmentRepository();
const doctorRepo = new DoctorRepository();
const appointmentService = new AppointmentService(appointmentRepo, doctorRepo);
const appointmentController = new AppointmentController(appointmentService);

const createAppointmentSchema = Joi.object({
  dateTime: Joi.date().required(),
  appointmentType: Joi.string().required(),
  userId: Joi.number().required(),
  doctorId: Joi.number().required(),
});

const updateAppointmentSchema = Joi.object({
  dateTime: Joi.date().required(),
});

const reassignDoctorSchema = Joi.object({
  newDoctorId: Joi.number().required(),
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware(['patient', 'admin']),
  validateMiddleware(createAppointmentSchema),
  appointmentController.createAppointment
);

router.get(
  '/',
  authMiddleware,
  appointmentController.listAppointments
);

router.get(
  '/:appointmentId',
  authMiddleware,
  roleMiddleware(['admin', 'patient']),
  appointmentController.getAppointment
);


router.patch(
  '/:appointmentId',
  authMiddleware,
  roleMiddleware(['patient', 'admin']),
  validateMiddleware(updateAppointmentSchema),
  appointmentController.updateAppointment
);

router.patch(
  '/:appointmentId/reassign',
  authMiddleware,
  roleMiddleware(['admin']),
  validateMiddleware(reassignDoctorSchema),
  appointmentController.reassignDoctor
);


router.patch(
  '/:appointmentId/cancel',
  authMiddleware,
  roleMiddleware(['patient', 'admin']),
  appointmentController.cancelAppointment
);

export default router;
