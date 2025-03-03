
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { DoctorRepository } from '../repositories/DoctorRepository';
import { Appointment } from '../models/Appointment';

export class AppointmentService {
  constructor(
    private appointmentRepo: AppointmentRepository,
    private doctorRepo: DoctorRepository
  ) { }


  public async createAppointment(data: {
    dateTime: Date;
    appointmentType: string;
    userId: number;
    doctorId: number;
  }): Promise<Appointment> {

    if (data.dateTime < new Date()) {
      throw new Error('Cannot schedule an appointment in the past');
    }


    const dayOfWeek = this.getDayOfWeek(data.dateTime);
    const schedules = await this.doctorRepo.getSchedulesByDoctorAndDay(data.doctorId, dayOfWeek);

    if (!this.isWithinSchedule(data.dateTime, schedules)) {
      throw new Error('Doctor no disponible en ese horario');
    }


    const doctorConflict = await this.appointmentRepo.hasConflictingAppointment(data.doctorId, data.dateTime);
    if (doctorConflict) {
      throw new Error('El doctor ya tiene una cita en ese horario');
    }

    const patientConflict = await this.appointmentRepo.hasConflictingPatientAppointment(data.userId, data.dateTime);
    if (patientConflict) {
      throw new Error('El paciente tiene una cita en ese horario');
    }


    const newAppointment = new Appointment(
      0,
      data.dateTime,
      data.appointmentType,
      'scheduled',
      data.userId,
      data.doctorId
    );
    return this.appointmentRepo.create(newAppointment);
  }

  public async getAppointmentById(appointmentId: number): Promise<Appointment | null> {
    return this.appointmentRepo.findById(appointmentId);
  }

  public async listAppointments(userId: number): Promise<Appointment[]> {
    return this.appointmentRepo.findAllByUser(userId);
  }

  public async listAppointmentsByDoctor(userId: number): Promise<Appointment[]> {

    const doctorProfile = await this.doctorRepo.getDoctorProfileByUserId(userId);
    if (!doctorProfile) {
      throw new Error('Doctor profile not found');
    }
    return this.appointmentRepo.findAllByDoctor(doctorProfile.doctor.doctorId);
  }


  public async listAllAppointments(): Promise<Appointment[]> {
    return this.appointmentRepo.findAllAppointments();
  }



  public async updateAppointment(appointmentId: number, data: { dateTime: Date; appointmentType: string }): Promise<Appointment> {

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'scheduled') {
      throw new Error('Only scheduled appointments can be updated');
    }

    const now = new Date();
    const diffHours = (appointment.dateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const minHoursBeforeUpdate = 2;
    if (diffHours < minHoursBeforeUpdate) {
      throw new Error(`Cannot update appointment less than ${minHoursBeforeUpdate} hours before the scheduled time`);
    }
    if (data.dateTime < new Date()) {
      throw new Error('Cannot set appointment in the past');
    }

    const dayOfWeek = this.getDayOfWeek(data.dateTime);
    const schedules = await this.doctorRepo.getSchedulesByDoctorAndDay(appointment.doctorId, dayOfWeek);
    if (!this.isWithinSchedule(data.dateTime, schedules)) {
      throw new Error('Doctor is not available at the new time');
    }

    const doctorConflict = await this.appointmentRepo.hasConflictingAppointment(appointment.doctorId, data.dateTime);
    if (doctorConflict) {
      throw new Error('There is already another appointment for this doctor at the new time');
    }

    const patientConflict = await this.appointmentRepo.hasConflictingPatientAppointment(appointment.userId, data.dateTime);
    if (patientConflict) {
      throw new Error('The patient already has another appointment at the new time');
    }

    appointment.dateTime = data.dateTime;
    appointment.appointmentType = data.appointmentType;
    return this.appointmentRepo.update(appointment);
  }


  public async reassignDoctor(appointmentId: number, newDoctorId: number): Promise<void> {

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    if (appointment.status !== 'scheduled') {
      throw new Error('Only scheduled appointments can be reassigned');
    }
    const dayOfWeek = this.getDayOfWeek(appointment.dateTime);
    const schedules = await this.doctorRepo.getSchedulesByDoctorAndDay(newDoctorId, dayOfWeek);
    if (!this.isWithinSchedule(appointment.dateTime, schedules)) {
      throw new Error('New doctor is not available at the scheduled time');
    }

    const conflict = await this.appointmentRepo.hasConflictingAppointment(newDoctorId, appointment.dateTime);
    if (conflict) {
      throw new Error('New doctor already has an appointment at that time');
    }

    await this.appointmentRepo.updateDoctor(appointmentId, newDoctorId);
  }


  public async cancelAppointment(appointmentId: number): Promise<void> {

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    console.log(appointment)
    if (appointment.status !== 'scheduled') {
      throw new Error('Only scheduled appointments can be canceled');
    }

    const now = new Date();
    const diffHours = (appointment.dateTime.getTime() - (now.getTime() - (5 * 60 * 60 * 1000))) / (1000 * 60 * 60);

    if (diffHours < 24) {
      throw new Error('Cannot cancel appointment within 24 hours of its scheduled time');
    }
    await this.appointmentRepo.updateStatus(appointmentId, 'canceled');
  }


  private getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  private isWithinSchedule(dateTime: Date, schedules: any[]): boolean {

    const appointmentMinutes = dateTime.getUTCHours() * 60 + dateTime.getUTCMinutes();

    return schedules.some(schedule => {

      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      return appointmentMinutes >= start && appointmentMinutes <= end;
    });
  }
}
