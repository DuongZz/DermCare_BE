export interface EditUserInput {
  email: string;
  fullName: string;
}

export interface UpdateMedicalInfoInput {
  skinType?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  currentMedications?: string;
  chronicConditions?: string;
}
