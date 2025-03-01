import { getConnection } from '../utils/db';
import { Doctor } from '../models/Doctor';
import oracledb from 'oracledb';

export class DoctorRepository {
    public async findById(doctorId: number): Promise<Doctor | null> {
        const conn = await getConnection();
        try {
            const result = await conn.execute(
                `SELECT doctor_id, first_name, last_name, specialty
         FROM DOCTORS
         WHERE doctor_id = :doctorId`,
                { doctorId },
            );

            const row = result.rows?.[0];
            if (!row) return null;

            const typedRow = row as {
                DOCTOR_ID: number;
                FIRST_NAME: string;
                LAST_NAME: string;
                SPECIALTY: string;
            };


            return new Doctor(
                typedRow.DOCTOR_ID,
                typedRow.FIRST_NAME,
                typedRow.LAST_NAME,
                typedRow.SPECIALTY,
            );
        } finally {
            await conn.close();
        }
    }


    public async create(doctor: Doctor): Promise<Doctor> {
        const conn = await getConnection();
        try {
            const result = await conn.execute(
                `INSERT INTO DOCTORS (doctor_id, first_name, last_name, specialty)
         VALUES (DOCTOR_SEQ.NEXTVAL, :firstName, :lastName, :specialty)
         RETURNING doctor_id INTO :outDoctorId`,
                {
                    firstName: doctor.firstName,
                    lastName: doctor.lastName,
                    specialty: doctor.specialty,
                    outDoctorId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                },
                { autoCommit: true }
            );

            const doctorId = (result.outBinds as any).outDoctorId[0];
            doctor.doctorId = doctorId;
            return doctor;
        } finally {
            await conn.close();
        }
    }


    public async getSchedulesByDoctorAndDay(doctorId: number, dayOfWeek: string) {
        const conn = await getConnection();
        try {
            const result = await conn.execute(
                `SELECT schedule_id, day_of_week, start_time, end_time
         FROM DOCTOR_SCHEDULE
         WHERE doctor_id = :doctorId
         AND day_of_week = :dayOfWeek`,
                { doctorId, dayOfWeek },
            );

            return result.rows || [];
        } finally {
            await conn.close();
        }
    }
}
