import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { validateMiddleware } from '../middlewares/validateMiddleware';
import { DoctorService } from '../services/DoctorService';
import { DoctorRepository } from '../repositories/DoctorRepository';
import Joi from 'joi';


const router = Router();

const doctorRepository = new DoctorRepository()
const doctorService = new DoctorService(doctorRepository)
const userRepository = new UserRepository();
const authService = new AuthService(userRepository, doctorService);
const authController = new AuthController(authService);

const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'patient', 'doctor').required(),
  specialty: Joi.string().when('role', {
    is: 'doctor',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  })
});


const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Register
router.post('/register', validateMiddleware(registerSchema), authController.register);

// Login
router.post('/login', validateMiddleware(loginSchema), authController.login);

export default router;
