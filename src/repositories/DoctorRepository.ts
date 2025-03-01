import { getConnection } from '../utils/db';
import { Doctor } from '../models/Doctor';
import oracledb from 'oracledb';

export class DoctorRepository {
   
    public async create(doctor: Doctor): Promise<Doctor> {
        const conn = await getConnection();
        try {
            const result = await conn.execute(
                `INSERT INTO DOCTORS (doctor_id, user_id, specialty)
         VALUES (DOCTOR_SEQ.NEXTVAL, :userId, :specialty)
         RETURNING doctor_id INTO :outDoctorId`,
                {
                    userId: doctor.userId,
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

    public async getDoctorById(doctorId: number): Promise<Doctor | null> {
        const conn = await getConnection();
        try {
            const result = await conn.execute(
                `SELECT doctor_id, user_id, specialty
             FROM DOCTORS
             WHERE doctor_id = :doctorId`,
                { doctorId }
            );
            const row = result.rows?.[0];
            if (!row) return null;

         
            const typedRow = row as {
                DOCTOR_ID: number;
                USER_ID: number;
                SPECIALTY: string;
            };

            return new Doctor(
                typedRow.DOCTOR_ID,
                typedRow.USER_ID,
                typedRow.SPECIALTY
            );
        } finally {
            await conn.close();
        }
    }


  
    public async getDoctorProfileByUserId(userId: number): Promise<{ doctor: Doctor; firstName: string; lastName: string } | null> {
        const conn = await getConnection();
        try {
            const result = await conn.execute(
                `SELECT d.doctor_id AS "doctorId",
                d.user_id AS "userId",
                d.specialty AS "specialty",
                u.first_name AS "firstName",
                u.last_name AS "lastName"
         FROM DOCTORS d
         JOIN USERS u ON d.user_id = u.user_id
         WHERE d.user_id = :userId`,
                { userId }
            );
            const row = result.rows?.[0];
            if (!row) return null;

            const typedRow = row as {
                doctorId: number;
                userId: number;
                specialty: string;
                firstName: string;
                lastName: string;
            };

            return {
                doctor: new Doctor(typedRow.doctorId, typedRow.userId, typedRow.specialty),
                firstName: typedRow.firstName,
                lastName: typedRow.lastName,
            };
        } finally {
            await conn.close();
        }
    }


    public async getSchedulesByDoctorAndDay(doctorId: number, dayOfWeek: string): Promise<any[]> {
        const conn = await getConnection();
        try {
            const result = await conn.execute(
                `SELECT day_of_week AS "dayOfWeek",
                    start_time AS "startTime",
                    end_time AS "endTime"
             FROM DOCTOR_SCHEDULE
             WHERE doctor_id = :doctorId
               AND day_of_week = :dayOfWeek`,
                { doctorId, dayOfWeek }
            );
            return result.rows || [];
        } finally {
            await conn.close();
        }
    }


}
