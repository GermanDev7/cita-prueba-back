export class doctorSchedule {
    constructor(
        public scheduleId: number,
        public doctorId: number,
        public dayOfWeek: string,
        public startTime: string,
        public endTime: string,
    ) { }
}