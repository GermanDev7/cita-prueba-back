import { getConnection } from '../utils/db';
import { Appointment } from '../models/Appointment';
import oracledb from 'oracledb';
export class AppointmentRepository {
  public async create(appointment: Appointment): Promise<Appointment> {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `INSERT INTO APPOINTMENTS (appointment_id, date_time, appointment_type, status, user_id, doctor_id)
         VALUES (APPOINTMENT_SEQ.NEXTVAL, :dateTime, :appointmentType, :status, :userId, :doctorId)
         RETURNING appointment_id INTO :outAppointmentId`,
        {
          dateTime: appointment.dateTime,
          appointmentType: appointment.appointmentType,
          status: appointment.status,
          userId: appointment.userId,
          doctorId: appointment.doctorId,
          outAppointmentId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: true }
      );

      const appointmentId = (result.outBinds as any).outAppointmentId[0];
      appointment.appointmentId = appointmentId;
      return appointment;
    } finally {
      await conn.close();
    }
  }

  public async findById(appointmentId: number): Promise<Appointment | null> {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `SELECT appointment_id, date_time, appointment_type, status, user_id, doctor_id
         FROM APPOINTMENTS
         WHERE appointment_id = :appointmentId`,
        { appointmentId },
      );

      const row = result.rows?.[0];
      if (!row) return null;

      const typedRow = row as {
        APPOINTMENT_ID: number;
        DATE_TIME: Date;
        APPOINTMENT_TYPE: string;
        STATUS: string;
        USER_ID: number
        DOCTOR_ID: number
      };

      return new Appointment(
        typedRow.APPOINTMENT_ID,
        typedRow.DATE_TIME,
        typedRow.APPOINTMENT_TYPE,
        typedRow.STATUS,
        typedRow.USER_ID,
        typedRow.DOCTOR_ID
      );
    } finally {
      await conn.close();
    }
  }
  
  public async updateStatus(appointmentId: number, status: string): Promise<void> {
    const conn = await getConnection();
    try {
      await conn.execute(
        `UPDATE APPOINTMENTS
         SET status = :status
         WHERE appointment_id = :appointmentId`,
        { status, appointmentId },
        { autoCommit: true }
      );
    } finally {
      await conn.close();
    }
  }
}
