// src/services/DoctorService.ts
import { DoctorRepository } from '../repositories/DoctorRepository';
import { Doctor } from '../models/Doctor';

export class DoctorService {
  constructor(private doctorRepo: DoctorRepository) {}

  public async createDoctor(data: {
    firstName: string;
    lastName: string;
    specialty: string;
  }): Promise<Doctor> {
    const doctor = new Doctor(0, data.firstName, data.lastName, data.specialty);
    return this.doctorRepo.create(doctor);
  }

  public async getDoctorById(doctorId: number): Promise<Doctor | null> {
    return this.doctorRepo.findById(doctorId);
  }
}
