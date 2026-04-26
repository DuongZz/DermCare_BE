export interface AnalyzeRequest {
  conversationId: string;
  patientId: string;
  fileBuffer?: Buffer;
  fileName?: string;
  mimeType?: string;
  fileUrl?: string;
  description?: string;
}
