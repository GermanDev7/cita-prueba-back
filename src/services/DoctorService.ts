import { DoctorRepository } from '../repositories/DoctorRepository';
import { Doctor } from '../models/Doctor';

export class DoctorService {
  constructor(private doctorRepo: DoctorRepository) { }

  public async createDoctor(data: { userId: number; specialty: string }): Promise<Doctor> {
    const doctor = new Doctor(0, data.userId, data.specialty);
    return this.doctorRepo.create(doctor);
  }

  public async getDoctorProfile(userId: number): Promise<{ doctor: Doctor; firstName: string; lastName: string } | null> {
    return this.doctorRepo.getDoctorProfileByUserId(userId);
  }

  public async getDoctorById(doctorId: number): Promise<Doctor | null> {
    return this.doctorRepo.getDoctorById(doctorId);
  }

  public async getDoctorsBySpecialty(specialty: string): Promise<{ doctorId: number; doctorName: string }[]> {
    return this.doctorRepo.findDoctorsBySpecialty(specialty);
  }
}
