import { scheduleReminder } from './notifications';
import { BikeDashboard } from '../types/dashboard.types';

const DAYS_BEFORE_EXPIRY = 10;

// Returns a readable name for each document type.
function documentLabel(doc: BikeDashboard['documents'][number]) {
  return doc.type === 'OTHER' ? doc.title ?? 'Document' : doc.type;
}

// Schedules reminders for documents that are expired or expiring soon.
async function scheduleDocumentReminders(dashboard: BikeDashboard) {
  for (const doc of dashboard.documents) {
    const label = documentLabel(doc);

    // Notify the user immediately if the document has already expired.
    if (doc.status === 'expired') {
      await scheduleReminder(
        `doc-expired-${doc._id}`,
        `${label} Expired`,
        `Your ${label.toLowerCase()} expired on ${new Date(doc.expiryDate).toLocaleDateString()}.`,
        new Date(Date.now() + 2000)
      );
      continue;
    }

    // Schedule the reminder 10 days before the expiry date.
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

// Schedules a reminder when the bike's service is due or overdue.
async function scheduleServiceReminder(dashboard: BikeDashboard) {
  const { bike, serviceDue } = dashboard;

  // No reminder is needed while the bike's service is on track.
  if (serviceDue.status === 'normal') return;

  // Create a message based on how urgently the service is needed.
  const body =
    serviceDue.status === 'overdue'
      ? `${bike.brand} ${bike.model} is overdue for service.`
      : `${bike.brand} ${bike.model} is due for service in ${serviceDue.remainingKm} km.`;

  // Show the service reminder shortly after it is scheduled.
  await scheduleReminder(
    `service-${bike._id}`,
    serviceDue.status === 'overdue' ? 'Service Overdue' : 'Service Due Soon',
    body,
    new Date(Date.now() + 2000)
  );
}

// Schedules all document and service reminders for the selected bike.
export async function scheduleBikeReminders(dashboard: BikeDashboard) {
  await scheduleDocumentReminders(dashboard);
  await scheduleServiceReminder(dashboard);
}