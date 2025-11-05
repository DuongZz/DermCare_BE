export interface INotificationEmailParams {
  to: string
  subject: string
  title: string
  message?: string
  userName?: string
  errorMessage?: string
  errorStack?: string
  supportEmail?: string
}
