import cron from 'node-cron';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { Task } from '../models/Task.js';
import { sendEmail } from '../services/mail.service.js';

export async function runRemindersTick(now = new Date()) {
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const dueTasks = await Task.find({
    status: { $ne: 'done' },
    assignee: { $ne: null },
    dueDate: { $lte: in24h },
  })
    .populate('assignee', 'name email')
    .populate('eventId', 'title')
    .lean();

  let taskEmails = 0;
  for (const task of dueTasks) {
    if (!task.assignee?.email) continue;
    await sendEmail({
      to: task.assignee.email,
      subject: `Task reminder: ${task.title}`,
      text: `Hi ${task.assignee.name}, your task "${task.title}" for ${task.eventId?.title || 'an event'} is due on ${new Date(task.dueDate).toDateString()}.`,
    }).catch(() => {});
    taskEmails += 1;
  }

  const upcomingEvents = await Event.find({
    status: 'confirmed',
    startAt: { $gte: now, $lte: in24h },
  }).lean();

  let attendeeEmails = 0;
  for (const ev of upcomingEvents) {
    const regs = await Registration.find({ eventId: ev._id }).lean();
    for (const reg of regs) {
      await sendEmail({
        to: reg.email,
        subject: `Reminder: ${ev.title} is tomorrow!`,
        text: `Hi ${reg.name}, reminder that ${ev.title} starts on ${new Date(ev.startAt).toUTCString()}. Bring your QR code: ${reg.qrToken}`,
      }).catch(() => {});
      attendeeEmails += 1;
    }
  }

  return { taskEmails, attendeeEmails };
}

export function startRemindersJob() {
  return cron.schedule(
    '0 8 * * *',
    () => {
      runRemindersTick().catch((err) => console.error('Reminders job failed:', err));
    },
    { timezone: 'Asia/Kolkata' }
  );
}

