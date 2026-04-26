export interface Appointment {
  appointmentDate: string;
  appointmentTime: string;
  note: string;
  price: number;
}

export interface BookingAppointmentInput {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  conversationId?: string;
}
