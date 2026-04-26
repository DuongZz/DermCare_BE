export interface CreateFeedbackInput {
  appointmentId: string;
  patientId: string;
  rate: number;
  comment: string;
}
