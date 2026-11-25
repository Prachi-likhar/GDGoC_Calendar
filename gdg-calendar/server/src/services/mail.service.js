import { env } from '../config/env.js';
import { getMailTransporter } from '../config/mail.js';

export async function sendEmail({ to, subject, html, text, attachments }) {
  const transporter = getMailTransporter();
  if (!transporter) {
    return { skipped: true };
  }

  return transporter.sendMail({
    from: env.smtpUser,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

