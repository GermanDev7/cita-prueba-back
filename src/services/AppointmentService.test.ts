import { AppointmentService } from './AppointmentService';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { DoctorRepository } from '../repositories/DoctorRepository';
import { Appointment } from '../models/Appointment';

const mockAppointmentRepo = {
  create: jest.fn(),
  hasConflictingAppointment: jest.fn(),
  hasConflictingPatientAppointment: jest.fn(),
  // Agrega otros métodos si es necesario
};

const mockDoctorRepo = {
  getSchedulesByDoctorAndDay: jest.fn(),
};

describe('AppointmentService', () => {
  let appointmentService: AppointmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    appointmentService = new AppointmentService(
      mockAppointmentRepo as unknown as AppointmentRepository,
      mockDoctorRepo as unknown as DoctorRepository
    );
  });

  describe('createAppointment', () => {
    it('should throw an error if appointment is scheduled in the past', async () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      await expect(appointmentService.createAppointment({
        dateTime: pastDate,
        appointmentType: 'General Checkup',
        userId: 1,
        doctorId: 1,
      })).rejects.toThrow('Cannot schedule an appointment in the past');
    });

    it('should throw an error if doctor is not available at the given time', async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); 
      mockDoctorRepo.getSchedulesByDoctorAndDay.mockResolvedValue([]);

      await expect(appointmentService.createAppointment({
        dateTime: futureDate,
        appointmentType: 'General Checkup',
        userId: 1,
        doctorId: 1,
      })).rejects.toThrow('Doctor no disponible en ese horario');
    });

    it('should throw an error if there is a conflict for the doctor', async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      
      mockDoctorRepo.getSchedulesByDoctorAndDay.mockResolvedValue([
        { startTime: '08:00', endTime: '17:00', dayOfWeek: 'Wednesday' }
      ]);
      mockAppointmentRepo.hasConflictingAppointment.mockResolvedValue(true);

      await expect(appointmentService.createAppointment({
        dateTime: futureDate,
        appointmentType: 'General Checkup',
        userId: 1,
        doctorId: 1,
      })).rejects.toThrow('Doctor no disponible en ese horario');
    });

    it('should throw an error if there is a conflict for the patient', async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      mockDoctorRepo.getSchedulesByDoctorAndDay.mockResolvedValue([
        { startTime: '08:00', endTime: '17:00', dayOfWeek: 'Wednesday' }
      ]);
      mockAppointmentRepo.hasConflictingAppointment.mockResolvedValue(false);
      mockAppointmentRepo.hasConflictingPatientAppointment.mockResolvedValue(true);

      await expect(appointmentService.createAppointment({
        dateTime: futureDate,
        appointmentType: 'General Checkup',
        userId: 1,
        doctorId: 1,
      })).rejects.toThrow('Doctor no disponible en ese horario');
    });

    it('should create an appointment if all validations pass', async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      mockDoctorRepo.getSchedulesByDoctorAndDay.mockResolvedValue([
        { startTime: '08:00', endTime: '17:00', dayOfWeek: 'Wednesday' }
      ]);
      mockAppointmentRepo.hasConflictingAppointment.mockResolvedValue(false);
      mockAppointmentRepo.hasConflictingPatientAppointment.mockResolvedValue(false);

      const createdAppointment = new Appointment(101, futureDate, 'General Checkup', 'scheduled', 1, 1);
      mockAppointmentRepo.create.mockResolvedValue(createdAppointment);

      const result = await appointmentService.createAppointment({
        dateTime: futureDate,
        appointmentType: 'General Checkup',
        userId: 1,
        doctorId: 1,
      });

      expect(result).toEqual(createdAppointment);
    });
  });
});
