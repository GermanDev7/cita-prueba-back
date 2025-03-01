import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';

export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}


  public createAppointment = async (req: Request, res: Response): Promise<void> => {
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
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
    }
  };

 
  public listAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user || !user.userId) {
        res.status(401).json({ error: 'Unauthorized: user information not found' });
        return;
      }
      const appointments = await this.appointmentService.listAppointments(user.userId);
      res.status(200).json(appointments);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
    }
  };
  

 
  public updateAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      const { dateTime, appointmentType } = req.body;
      const updatedAppointment = await this.appointmentService.updateAppointment(Number(appointmentId), {
        dateTime: new Date(dateTime),
        appointmentType
      });
      res.status(200).json(updatedAppointment);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
    }
  };


  public reassignDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      const { newDoctorId } = req.body;
      await this.appointmentService.reassignDoctor(Number(appointmentId), Number(newDoctorId));
      res.status(200).json({ message: 'Doctor reassigned successfully' });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
    }
  };


  public cancelAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      await this.appointmentService.cancelAppointment(Number(appointmentId));
      res.status(200).json({ message: 'Appointment canceled successfully' });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
    }
  };
}
