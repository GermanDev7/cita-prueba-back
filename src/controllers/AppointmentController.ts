import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';

export class AppointmentController {
  constructor(private appointmentService: AppointmentService) { }


  public createAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { dateTime, appointmentType, userId, doctorId } = req.body;
      const appointment = await this.appointmentService.createAppointment({
        dateTime,
        appointmentType,
        userId,
        doctorId
      });
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
    }
  };

  public getAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      const id = parseInt(appointmentId, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid appointment ID' });
        return;
      }

      const appointment = await this.appointmentService.getAppointmentById(id);
      if (!appointment) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
      }

      res.status(200).json(appointment);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
    }
  };


  public listAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user || !user.userId || !user.role) {
        res.status(401).json({ error: 'Unauthorized: user information not found' });
        return;
      }

      let appointments;

      if (user.role === 'patient') {

        appointments = await this.appointmentService.listAppointments(user.userId);
      } else if (user.role === 'doctor') {

        appointments = await this.appointmentService.listAppointmentsByDoctor(user.userId);
      } else {
        appointments = await this.appointmentService.listAllAppointments();
      }

      res.status(200).json(appointments);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unexpected error' });
    }
  };




  public updateAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      const { dateTime } = req.body;
      const updatedAppointment = await this.appointmentService.updateAppointment(Number(appointmentId), {
        dateTime: new Date(dateTime)
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
