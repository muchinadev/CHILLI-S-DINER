import { query } from "@/lib/db/client";

export type AdminUser = {
  id: string;
  business_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
};

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const result = await query<AdminUser>(
    `select id, business_id, name, email, password_hash, role
     from admin_users where email = $1`,
    [email.trim().toLowerCase()],
  );
  return result.rows[0] ?? null;
}
