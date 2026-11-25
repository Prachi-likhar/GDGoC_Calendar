import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const IST_TIMEZONE = 'Asia/Kolkata';

export function formatIST(utcDate, pattern = 'dd MMM yyyy, hh:mm a') {
  if (!utcDate) return '';
  return `${formatInTimeZone(new Date(utcDate), IST_TIMEZONE, pattern)} IST`;
}

export function formatISTDateOnly(utcDate, pattern = 'dd MMM yyyy') {
  if (!utcDate) return '';
  return formatInTimeZone(new Date(utcDate), IST_TIMEZONE, pattern);
}

export function toISTInputValue(utcDate) {
  if (!utcDate) return '';
  return formatInTimeZone(new Date(utcDate), IST_TIMEZONE, "yyyy-MM-dd'T'HH:mm");
}

export function fromISTInputValue(localInputValue) {
  if (!localInputValue) return '';
  return fromZonedTime(localInputValue, IST_TIMEZONE).toISOString();
}

