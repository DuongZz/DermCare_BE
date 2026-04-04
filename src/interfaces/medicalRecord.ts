export interface CreateMedicalRecordDto {
  appointmentId: string;
  doctorId: string;
  treatment: string;
  note: string;
  images: string[];
  patientInfo: string;
  doctorInfo: string;
}
