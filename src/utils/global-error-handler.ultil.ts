import { crashReportEmail } from '@/providers/nodemailer.provider'
import ENV from '@/configs/env.config'
import CONSTANT from '@/configs/constant.config'

export const setupGlobalErrorHandlers = () => {
  // Xử lý uncaughtException
  process.on('uncaughtException', async error => {
    if (ENV.NODE_ENV !== CONSTANT.NODE.DEV) {
      try {
        await crashReportEmail(error)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error sending crash report email (uncaughtException):', err)
      }
    }
    process.exit(1)
  })

  // Xử lý unhandledRejection
  process.on('unhandledRejection', async reason => {
    if (ENV.NODE_ENV !== CONSTANT.NODE.DEV) {
      try {
        const error = reason instanceof Error ? reason : new Error(String(reason))
        await crashReportEmail(error)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error sending crash report email (unhandledRejection):', err)
      }
    }
  })
}
