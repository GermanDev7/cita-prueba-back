
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
        `SELECT appointment_id AS "appointmentId",
                date_time AS "dateTime",
                appointment_type AS "appointmentType",
                status,
                user_id AS "userId",
                doctor_id AS "doctorId"
         FROM APPOINTMENTS
         WHERE appointment_id = :appointmentId`,
        { appointmentId }
      );
      const row = result.rows?.[0];
      if (!row) return null;

      const typedRow = row as {
        appointmentId: number;
        dateTime: Date;
        appointmentType: string;
        status: string;
        userId: number;
        doctorId: number;
      };

      return new Appointment(
        typedRow.appointmentId,
        typedRow.dateTime,
        typedRow.appointmentType,
        typedRow.status,
        typedRow.userId,
        typedRow.doctorId
      );
    } finally {
      await conn.close();
    }
  }



  public async findAllByUser(userId: number): Promise<Appointment[]> {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `SELECT appointment_id AS "appointmentId",
                date_time AS "dateTime",
                appointment_type AS "appointmentType",
                status,
                user_id AS "userId",
                doctor_id AS "doctorId"
         FROM APPOINTMENTS
         WHERE user_id = :userId`,
        { userId }
      );
      const appointments: Appointment[] = [];
      if (result.rows) {
        for (const row of result.rows) {
          const typedRow = row as {
            appointmentId: number;
            dateTime: Date;
            appointmentType: string;
            status: string;
            userId: number;
            doctorId: number;
          };
          appointments.push(
            new Appointment(
              typedRow.appointmentId,
              typedRow.dateTime,
              typedRow.appointmentType,
              typedRow.status,
              typedRow.userId,
              typedRow.doctorId
            )
          );
        }
      }
      return appointments;
    } finally {
      await conn.close();
    }
  }


  public async update(appointment: Appointment): Promise<Appointment> {
    const conn = await getConnection();
    try {
      await conn.execute(
        `UPDATE APPOINTMENTS
         SET date_time = :dateTime, appointment_type = :appointmentType
         WHERE appointment_id = :appointmentId`,
        {
          dateTime: appointment.dateTime,
          appointmentType: appointment.appointmentType,
          appointmentId: appointment.appointmentId,
        },
        { autoCommit: true }
      );
      return appointment;
    } finally {
      await conn.close();
    }
  }


  public async updateDoctor(appointmentId: number, doctorId: number): Promise<void> {
    const conn = await getConnection();
    try {
      await conn.execute(
        `UPDATE APPOINTMENTS
         SET doctor_id = :doctorId
         WHERE appointment_id = :appointmentId`,
        { doctorId, appointmentId },
        { autoCommit: true }
      );
    } finally {
      await conn.close();
    }
  }

  public async hasConflictingAppointment(doctorId: number, dateTime: Date): Promise<boolean> {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `SELECT COUNT(*) AS "count"
         FROM APPOINTMENTS
         WHERE doctor_id = :doctorId
         AND date_time = :dateTime
         AND status = 'scheduled'`,
        { doctorId, dateTime }
      );
      const row = result.rows?.[0] as { count: number };
      return row.count > 0;
    } finally {
      await conn.close();
    }
  }

  public async listAppointmentsByDoctor(userId: number): Promise<Appointment[]> {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `SELECT a.appointment_id AS "appointmentId",
                a.date_time AS "dateTime",
                a.appointment_type AS "appointmentType",
                a.status,
                a.user_id AS "userId",
                a.doctor_id AS "doctorId"
         FROM APPOINTMENTS a
         JOIN DOCTORS d ON a.doctor_id = d.doctor_id
         WHERE d.user_id = :userId`,
        { userId }
      );
      const appointments: Appointment[] = [];
      if (result.rows) {
        for (const row of result.rows) {
          const typedRow = row as {
            appointmentId: number;
            dateTime: Date;
            appointmentType: string;
            status: string;
            userId: number;
            doctorId: number;
          };
          appointments.push(new Appointment(
            typedRow.appointmentId,
            typedRow.dateTime,
            typedRow.appointmentType,
            typedRow.status,
            typedRow.userId,
            typedRow.doctorId
          ));
        }
      }
      return appointments;
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
