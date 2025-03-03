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

  public getDoctorsBySpecialty = async (req: Request, res: Response): Promise<void> => {
    try {
      const { specialty } = req.query;
      if (!specialty || typeof specialty !== 'string') {
        res.status(400).json({ error: 'Specialty query parameter is required and must be a string' });
        return;
      }
      const doctors = await this.doctorService.getDoctorsBySpecialty(specialty);
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message || 'Unexpected error' });
    }
  };
}
