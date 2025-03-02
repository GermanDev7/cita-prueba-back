// src/routes/appointmentRoutes.ts
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

// JSON schema for creating an appointment
const createAppointmentSchema = Joi.object({
  dateTime: Joi.date().required(),
  appointmentType: Joi.string().required(),
  userId: Joi.number().required(),
  doctorId: Joi.number().required(),
});

// JSON schema for updating an appointment (dateTime and appointmentType)
const updateAppointmentSchema = Joi.object({
  dateTime: Joi.date().required(),
  appointmentType: Joi.string().required(),
});

// JSON schema for reassigning a doctor
const reassignDoctorSchema = Joi.object({
  newDoctorId: Joi.number().required(),
});

// Endpoint to create an appointment
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['patient', 'admin']),
  validateMiddleware(createAppointmentSchema),
  appointmentController.createAppointment
);

// Endpoint to list appointments for the logged-in user
router.get(
  '/',
  authMiddleware,
  appointmentController.listAppointments
);

// Endpoint to update (reschedule) an appointment
router.patch(
  '/:appointmentId',
  authMiddleware,
  roleMiddleware(['patient', 'admin']),
  validateMiddleware(updateAppointmentSchema),
  appointmentController.updateAppointment
);

// Endpoint to reassign a doctor for an appointment
router.patch(
  '/:appointmentId/reassign',
  authMiddleware,
  roleMiddleware(['admin']), 
  validateMiddleware(reassignDoctorSchema),
  appointmentController.reassignDoctor
);

// Endpoint to cancel an appointment
router.patch(
  '/:appointmentId/cancel',
  authMiddleware,
  roleMiddleware(['patient', 'admin']),
  appointmentController.cancelAppointment
);

export default router;
