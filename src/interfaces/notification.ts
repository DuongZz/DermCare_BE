export interface CreateNotificationInput {
  title: string;
  content: string;
  type: string;
  referenceId?: string;
  recipientId: string;
}
