import type { Pool, PoolClient } from "pg";
import { pool, query } from "@/lib/db/client";

type QueryRunner = Pool | PoolClient;

export type NotificationRecipient = "customer" | "admin";
export type NotificationChannel = "sms" | "whatsapp" | "email" | "in_app";

export type NotificationRow = {
  id: string;
  business_id: string;
  recipient_type: NotificationRecipient;
  channel: NotificationChannel;
  template: string;
  payload: { message: string; phone?: string };
  status: "pending" | "sent" | "failed";
  created_at: string;
};

export type CreateNotificationInput = {
  businessId: string;
  recipientType: NotificationRecipient;
  channel: NotificationChannel;
  template: string;
  message: string;
  phone?: string;
};

/**
 * Logs a notification as sent. There's no real WhatsApp/SMS provider wired
 * up yet — this "mock send" always succeeds and just records what would
 * have gone out, the same architectural split as the mock payment
 * provider: swap this for a real API call later without touching callers.
 */
export async function createNotification(
  input: CreateNotificationInput,
  client?: QueryRunner,
): Promise<void> {
  const runner = client ?? pool;
  await runner.query(
    `insert into notifications (business_id, recipient_type, channel, template, payload, status)
     values ($1, $2, $3, $4, $5, 'sent')`,
    [
      input.businessId,
      input.recipientType,
      input.channel,
      input.template,
      JSON.stringify({ message: input.message, phone: input.phone }),
    ],
  );
}

export async function listRecentNotifications(businessId: string, limit = 50): Promise<NotificationRow[]> {
  const result = await query<NotificationRow>(
    `select * from notifications where business_id = $1 order by created_at desc limit $2`,
    [businessId, limit],
  );
  return result.rows;
}
