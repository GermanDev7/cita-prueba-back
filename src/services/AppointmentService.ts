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
   
    console.log(data.dateTime)
    const dayOfWeek = this.getDayOfWeek(data.dateTime);
    console.log(dayOfWeek)
    const schedules = await this.doctorRepo.getSchedulesByDoctorAndDay(data.doctorId, dayOfWeek);
    console.log(schedules);
    if (!this.isWithinSchedule(data.dateTime, schedules)) {
      throw new Error('Doctor is not available at this time');
    }
  
    const conflict = await this.appointmentRepo.hasConflictingAppointment(data.doctorId, data.dateTime);
    if (conflict) {
      throw new Error('There is already an appointment at this time');
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


  public async listAppointments(userId: number): Promise<Appointment[]> {
    return this.appointmentRepo.findAllByUser(userId);
  }


  public async updateAppointment(appointmentId: number, data: { dateTime: Date; appointmentType: string }): Promise<Appointment> {
    
    const currentAppointments = await this.appointmentRepo.findAllByUser(-1);

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (data.dateTime < new Date()) {
      throw new Error('Cannot set appointment in the past');
    }


    const dayOfWeek = this.getDayOfWeek(data.dateTime);
    const schedules = await this.doctorRepo.getSchedulesByDoctorAndDay(appointment.doctorId, dayOfWeek);
    if (!this.isWithinSchedule(data.dateTime, schedules)) {
      throw new Error('Doctor is not available at the new time');
    }


    const conflict = await this.appointmentRepo.hasConflictingAppointment(appointment.doctorId, data.dateTime);
    if (conflict) {
      throw new Error('There is already another appointment at the new time');
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

  
  private getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }


  private isWithinSchedule(dateTime: Date, schedules: any[]): boolean {
    const appointmentMinutes = dateTime.getUTCHours() * 60 + dateTime.getUTCMinutes();
    console.log(dateTime.getUTCHours(),dateTime.getUTCMinutes(), appointmentMinutes)

    return schedules.some(schedule => {
      
      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      return appointmentMinutes >= start && appointmentMinutes <= end;
    });
  }



  public async cancelAppointment(appointmentId: number): Promise<void> {

    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Rule
    const now = new Date();
    const diffHours = (appointment.dateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) {
      throw new Error('Cannot cancel appointment within 24 hours of its scheduled time');
    }

    // validation
    await this.appointmentRepo.updateStatus(appointmentId, 'canceled');
  }
}
