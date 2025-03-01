import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';

export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  public createAppointment = async (req: Request, res: Response) => {
    try {
      const { dateTime, appointmentType, userId, doctorId } = req.body;
      const appointment = await this.appointmentService.createAppointment({
        dateTime: new Date(dateTime),
        appointmentType,
        userId,
        doctorId
      });
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  public cancelAppointment = async (req: Request, res: Response) => {
    try {
      const { appointmentId } = req.params;
      await this.appointmentService.cancelAppointment(Number(appointmentId));
      res.status(200).json({ message: 'Appointment canceled successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
