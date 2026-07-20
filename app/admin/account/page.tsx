// app/admin/account/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div>
      <h1 className="a-h1">Account</h1>
      <p className="a-subtitle">Ingelogd als {user.email}.</p>

      <div style={{ marginTop: "1.5rem", maxWidth: "24rem" }} className="a-card">
        <div style={{ padding: "1.25rem" }}>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
