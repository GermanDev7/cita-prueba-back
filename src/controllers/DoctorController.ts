import { Request, Response } from 'express';
import { DoctorService } from '../services/DoctorService';

export class DoctorController {
  constructor(private doctorService: DoctorService) { }

  public createDoctor = async (req: Request, res: Response) => {
    try {
      const { userId, specialty } = req.body;
      const doctor = await this.doctorService.createDoctor({ userId, specialty });
      res.status(201).json(doctor);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  public getDoctor = async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.params;
      const doctor = await this.doctorService.getDoctorById(Number(doctorId));
      if (!doctor) {
        res.status(404).json({ error: 'Doctor not found' });

      }
      res.status(200).json(doctor);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  public getDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctors = await this.doctorService.getDoctors();
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message || 'Unexpected error' });
    }
  };
}
