
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { DoctorRepository } from '../repositories/DoctorRepository';
import { Appointment } from '../models/Appointment';

export class AppointmentService {
  constructor(
    private appointmentRepo: AppointmentRepository,
    private doctorRepo: DoctorRepository
  ) {}

  public async createAppointment(data: {
    dateTime: Date;
    appointmentType: string;
    userId: number;
    doctorId: number;
  }): Promise<Appointment> {
    // 1. Validate date/time is not in the past, etc.
    // 2. Check doctor availability:
    const dayOfWeek = this.getDayOfWeek(data.dateTime); // e.g. 'Monday'
    const schedules = await this.doctorRepo.getSchedulesByDoctorAndDay(data.doctorId, dayOfWeek);

    if (!this.isWithinSchedule(data.dateTime, schedules)) {
      throw new Error('Doctor is not available at this time');
    }

    // 3. Create appointment
    const newAppointment = new Appointment(
      0, // assigned by DB
      data.dateTime,
      data.appointmentType,
      'scheduled',
      data.userId,
      data.doctorId
    );
    return this.appointmentRepo.create(newAppointment);
  }

  public async cancelAppointment(appointmentId: number): Promise<void> {
    // Example business rule: do not allow cancelation within 24 hours, etc.
    // For now, simply update status
    await this.appointmentRepo.updateStatus(appointmentId, 'canceled');
  }

  private getDayOfWeek(date: Date): string {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[date.getDay()];
  }

  private isWithinSchedule(dateTime: Date, schedules: any[]): boolean {
    const appointmentMinutes = dateTime.getHours() * 60 + dateTime.getMinutes();

    return schedules.some(schedule => {
      const [startH, startM] = schedule.START_TIME.split(':').map(Number);
      const [endH, endM] = schedule.END_TIME.split(':').map(Number);

      const start = startH * 60 + startM;
      const end = endH * 60 + endM;

      return appointmentMinutes >= start && appointmentMinutes <= end;
    });
  }
}
