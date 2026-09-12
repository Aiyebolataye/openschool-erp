export const QUEUE_NAMES = {
  PAYMENTS: 'payments',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  REPORTS: 'report',
  BULK: 'bulk',
  CHAT: 'chat',
  ANALYTICS: 'analytics',
} as const;

export const JOB_TYPES = {
  PAYMENT_VERIFY: 'payment:verify',
  PAYMENT_RECONCILE: 'payment:reconcile',
  EMAIL_CREDENTIALS: 'email:credentials',
  EMAIL_RECEIPT: 'email:receipt',
  EMAIL_NOTICE: 'email:notice',
  SMS_REMINDER: 'sms:reminder',
  SMS_ALERT: 'sms:alert',
  PUSH_NOTIFICATION: 'push:notification',
  REPORT_PDF: 'report:pdf',
  REPORT_EXCEL: 'report:excel',
  BULK_INVOICES: 'bulk:invoices',
  BULK_IMPORT: 'bulk:import',
  CHAT_UNREAD: 'chat:unread',
  ANALYTICS_COMPUTE: 'analytics:compute',
} as const;