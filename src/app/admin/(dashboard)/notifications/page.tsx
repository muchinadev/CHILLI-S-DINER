import { getSession } from "@/lib/auth/session";
import { listRecentNotifications } from "@/lib/data/notifications";
import { formatDateTime } from "@/lib/format";

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  in_app: "In-app",
};

export default async function AdminNotificationsPage() {
  const session = await getSession();
  const notifications = await listRecentNotifications(session!.businessId, 50);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Notifications</h1>
        <p className="text-sm text-stone-500">
          Messages sent to customers and admin alerts. No real WhatsApp/SMS provider is connected yet — this is a
          log of what would have been sent.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    n.recipient_type === "admin" ? "bg-brand-100 text-brand-dark" : "bg-green-100 text-green-700"
                  }`}
                >
                  {n.recipient_type === "admin" ? "Admin alert" : "To customer"}
                </span>
                <span className="text-xs text-stone-400">
                  {CHANNEL_LABEL[n.channel] ?? n.channel} · {formatDateTime(n.created_at)}
                </span>
              </div>
              <p className="mt-2 text-sm text-stone-700">{n.payload.message}</p>
              {n.payload.phone ? <p className="mt-1 text-xs text-stone-400">To {n.payload.phone}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
