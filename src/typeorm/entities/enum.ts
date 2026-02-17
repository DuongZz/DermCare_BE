export const Role = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
} as const;

export type Role = typeof Role[keyof typeof Role];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export const SkinType = {
  OILY: 'Da dầu',
  DRY: 'Da khô',
  COMBINATION: 'Da hỗn hợp',
  NORMAL: 'Da thường',
  SENSITIVE: 'Da nhạy cảm',
} as const;

export type SkinType = typeof SkinType[keyof typeof SkinType];

export const BloodGroup = {
  A_POSITIVE: 'A_POSITIVE',
  A_NEGATIVE: 'A_NEGATIVE',
  B_POSITIVE: 'B_POSITIVE',
  B_NEGATIVE: 'B_NEGATIVE',
  AB_POSITIVE: 'AB_POSITIVE',
  AB_NEGATIVE: 'AB_NEGATIVE',
  O_POSITIVE: 'O_POSITIVE',
  O_NEGATIVE: 'O_NEGATIVE',
} as const;

export type BloodGroup = typeof BloodGroup[keyof typeof BloodGroup];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
  COMPLETED: 'COMPLETED',
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const DiagnosisStatus = {
  AI_PENDING: 'AI_PENDING',
  CONSULTING: 'CONSULTING',
  FINALIZED: 'FINALIZED',
} as const;

export type DiagnosisStatus = typeof DiagnosisStatus[keyof typeof DiagnosisStatus];

export const ConversationStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type ConversationStatus = typeof ConversationStatus[keyof typeof ConversationStatus];
