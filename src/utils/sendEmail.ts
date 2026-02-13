import nodemailer from 'nodemailer';

import { CustomError } from 'utils/response/custom-error/CustomError';

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new CustomError(500, 'General', 'Error sending email', null, error);
  }
};
