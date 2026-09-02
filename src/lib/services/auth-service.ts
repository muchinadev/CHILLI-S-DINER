"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { findAdminByEmail } from "@/lib/data/admin-users";
import { verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, createSessionCookie } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export type LoginState = { error: string | null };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const admin = await findAdminByEmail(parsed.data.email);
  if (!admin || !verifyPassword(parsed.data.password, admin.password_hash)) {
    return { error: "Incorrect email or password." };
  }

  await createSessionCookie({
    adminId: admin.id,
    businessId: admin.business_id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  redirect(parsed.data.next && parsed.data.next.startsWith("/admin") ? parsed.data.next : "/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}
