export interface EditUserInput {
  fullName?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: Date;
  address?: string;
}

export interface UpdateMedicalInfoInput {
  skinType?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  currentMedications?: string;
  chronicConditions?: string;
}
