export interface DayTemplateInput {
  dayOfWeek: string;
  isAvailable: boolean;
  morningStartTime: string;
  morningEndTime: string;
  afternoonStartTime: string;
  afternoonEndTime: string;
  slotDuration: number;
  price: number;
}
