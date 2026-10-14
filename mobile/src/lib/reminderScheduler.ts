import { scheduleReminder } from './notifications';
import { BikeDashboard } from '../types/dashboard.types';

const DAYS_BEFORE_EXPIRY = 10;

function documentLabel(doc: BikeDashboard['documents'][number]) {
  return doc.type === 'OTHER' ? doc.title ?? 'Document' : doc.type;
}

// Covers both cases: documents about to expire (counts down to real date)
// and documents already expired (fires now, since there's no future date left)
async function scheduleDocumentReminders(dashboard: BikeDashboard) {
  for (const doc of dashboard.documents) {
    const label = documentLabel(doc);

    if (doc.status === 'expired') {
      await scheduleReminder(
        `doc-expired-${doc._id}`,
        `${label} Expired`,
        `Your ${label.toLowerCase()} expired on ${new Date(doc.expiryDate).toLocaleDateString()}.`,
        new Date(Date.now() + 2000)
      );
      continue;
    }

    const reminderDate = new Date(doc.expiryDate);
    reminderDate.setDate(reminderDate.getDate() - DAYS_BEFORE_EXPIRY);

    await scheduleReminder(
      `doc-${doc._id}`,
      `${label} Expiring Soon`,
      `Your ${label.toLowerCase()} expires on ${new Date(doc.expiryDate).toLocaleDateString()}.`,
      reminderDate
    );
  }
}

// Km-based, not date-based — no real future date exists, so this fires
// immediately whenever the dashboard loads and the bike is due/overdue
async function scheduleServiceReminder(dashboard: BikeDashboard) {
  const { bike, serviceDue } = dashboard;
  if (serviceDue.status === 'normal') return;

  const body =
    serviceDue.status === 'overdue'
      ? `${bike.brand} ${bike.model} is overdue for service.`
      : `${bike.brand} ${bike.model} is due for service in ${serviceDue.remainingKm} km.`;

  await scheduleReminder(
    `service-${bike._id}`,
    serviceDue.status === 'overdue' ? 'Service Overdue' : 'Service Due Soon',
    body,
    new Date(Date.now() + 2000)
  );
}

export async function scheduleBikeReminders(dashboard: BikeDashboard) {
  await scheduleDocumentReminders(dashboard);
  await scheduleServiceReminder(dashboard);
}