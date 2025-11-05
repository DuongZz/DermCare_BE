/* eslint-disable no-console */
import connectDB from '@/configs/mongoose.config'
import cron from 'node-cron'
import { sendMailLogs } from '@/providers/nodemailer.provider'
import { backupDatabase } from '@/utils/backup-database.util'

connectDB()
  .then(() => {
    console.log('[Cron Worker]: Connected to database')
    cron.schedule(
      '0 22 * * *',
      async () => {
        await sendMailLogs()
      },
      {
        timezone: 'Asia/Ho_Chi_Minh',
      }
    )

    cron.schedule(
      '26 22 * * *',
      async () => {
        console.log('[Cron Worker]: Starting database backup...')
        await backupDatabase()
      },
      {
        timezone: 'Asia/Ho_Chi_Minh',
      }
    )
  })
  .catch(error => {
    console.log('[Cron Worker]: Error starting server', error)
    process.exit(1)
  })
