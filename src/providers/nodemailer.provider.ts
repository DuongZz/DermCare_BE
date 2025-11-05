import { promises as fs } from 'fs'
import nodemailer from 'nodemailer'
import ENV from '../configs/env.config'
import path from 'path'
import pug from 'pug'
import CONSTANT from '@/configs/constant.config'
import { INotificationEmailParams } from '@/interfaces/nodemailer.interface'

const TEMPLATE_DIR = path.resolve('src/templates/')

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: ENV.NODEMAILER.SENDER,
    pass: ENV.NODEMAILER.APP_PASSWORD,
  },
})

export const sendNotificationEmail = async (
  params: INotificationEmailParams
) => {
  try {
    const templatePath = path.join(TEMPLATE_DIR, 'notification_template.pug')
    const htmlContent = pug.renderFile(templatePath, {
      ...params,
      appName: ENV.NAME,
      year: new Date().getFullYear(),
    })

    await transporter.sendMail({
      from: ENV.NODEMAILER.SENDER,
      to: params.to,
      subject: params.subject,
      html: htmlContent,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('⚡ [Email Service] Error sending notification email:', error)
  }
}
// ví dụ về dùng otp pug cho email
export const sendOtpEmail = async (to: string, title: string, otp: string) => {
  try {
    const templatePath = path.join(TEMPLATE_DIR, 'otp_template.pug')
    const htmlContent = pug.renderFile(templatePath, { otp })

    await transporter.sendMail({
      from: ENV.NODEMAILER.SENDER,
      to,
      subject: title,
      html: htmlContent,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('⚡ [Email Service] Error sending OTP email:', error)
  }
}

export const sendUserNotificationEmail = async (
  to: string,
  title: string,
  message: string
) => {
  await sendNotificationEmail({
    to,
    subject: title,
    title,
    message,
    supportEmail: ENV.NODEMAILER.ADMIN_EMAIL,
  })
}

export const crashReportEmail = async (error: Error) => {
  await sendNotificationEmail({
    to: ENV.NODEMAILER.SENDER,
    subject: 'Crash Report',
    title: 'Crash Report',
    errorMessage: error.message,
    errorStack: error.stack,
    supportEmail: ENV.NODEMAILER.ADMIN_EMAIL,
  })
}

const renderTemplate = (templateName: string, locals: Record<string, any>) => {
  const templatePath = path.join(CONSTANT.FOLDER.TEMPLATE_DIR, templateName)
  return pug.renderFile(templatePath, locals)
}

export const sendMailLogs = async () => {
  const apiLogDir = CONSTANT.FOLDER.API_LOGS_DIR
  const errorLogDir = CONSTANT.FOLDER.ERROR_LOGS_DIR

  const getLatestLogFile = async (dir: string) => {
    const files = await fs.readdir(dir)
    const logFiles = await Promise.all(
      files
        .filter(file => file.endsWith('.log'))
        .map(async file => {
          const filePath = path.join(dir, file)
          const stat = await fs.stat(filePath)
          return {
            name: file,
            time: stat.mtime.getTime(),
            path: filePath,
          }
        })
    )

    if (logFiles.length === 0) {
      return null
    }
    return logFiles.sort((a, b) => b.time - a.time)[0]
  }

  try {
    const [latestApiLog, latestErrorLog] = await Promise.all([
      getLatestLogFile(apiLogDir),
      getLatestLogFile(errorLogDir),
    ])

    if (!latestApiLog && !latestErrorLog) {
      return
    }

    const attachments = []
    if (latestApiLog) {
      attachments.push({
        filename: latestApiLog.name,
        path: latestApiLog.path,
      })
    }
    if (latestErrorLog) {
      attachments.push({
        filename: latestErrorLog.name,
        path: latestErrorLog.path,
      })
    }

    const htmlContent = renderTemplate('mails/notification_template.pug', {
      recipient: 'Admin',
      sender: ENV.NODEMAILER.SENDER,
      appName: ENV.NAME,
      year: new Date().getFullYear(),
    })

    await transporter.sendMail({
      from: ENV.NODEMAILER.SENDER,
      to: ENV.NODEMAILER.ADMIN_EMAIL,
      subject: '📄 Log Report: Latest API & Error Logs',
      html: htmlContent,
      attachments,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('⚡ [Email Service] Error sending log report email:', error)
  }
}
