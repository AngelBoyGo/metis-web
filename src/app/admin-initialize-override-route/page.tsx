import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookieOptions } from "@/lib/session-cookie";
import styles from "./admin.module.css";

async function initializeAdmin(formData: FormData) {
  "use server";

  const input = formData.get("override_key");
  const expected = process.env.METIS_ADMIN_OVERRIDE_KEY;

  if (typeof input !== "string" || !expected || input !== expected) {
    redirect("/admin-initialize-override-route?rejected=1");
  }

  const cookieStore = await cookies();
  cookieStore.set("metis_admin_session", "active", sessionCookieOptions());

  redirect("/dashboard");
}

type Props = {
  searchParams: Promise<{ rejected?: string }>;
};

export default async function AdminInitializePage({ searchParams }: Props) {
  const { rejected } = await searchParams;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>METIS // ADMIN_OVERRIDE_GATE</header>
      <div className={styles.formCard}>
        <div className={styles.formTitle}>INITIALIZE_OVERRIDE //</div>
        <form action={initializeAdmin}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="override_key">
              OVERRIDE_KEY //
            </label>
            <input
              id="override_key"
              name="override_key"
              type="text"
              className={styles.input}
              required
              autoComplete="off"
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            ACTIVATE_ADMIN_SESSION //
          </button>
          {rejected ? (
            <p className={styles.rejected}>ACCESS_DENIED // override key rejected</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
