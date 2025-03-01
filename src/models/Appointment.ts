export class Appointment {
    constructor(
        public appointmentId: number,
        public dateTime: Date,
        public appointmentType: string,
        public status: string,
        public userId: number,
        public doctorId: number
    ) { }
}