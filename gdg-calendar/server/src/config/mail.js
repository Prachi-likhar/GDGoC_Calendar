import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter = null;

export function getMailTransporter() {
  if (!env.smtpHost || !env.smtpUser) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    });
  }
  return transporter;
}

