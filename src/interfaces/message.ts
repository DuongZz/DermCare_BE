export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  content: string;
  fileUrl?: string;
  type: 'text' | 'image';
}
