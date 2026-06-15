"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTransition, useState, type FormEvent } from "react";
import styles from "../auth.module.css";

export default function LoginPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inlineError, setInlineError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInlineError("");
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      let response: Response;
      try {
        response = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password"),
          }),
        });
      } catch {
        setInlineError("GATEWAY_CONNECTION_TIMEOUT //");
        return;
      }

      if (response.status >= 500) {
        setInlineError("GATEWAY_CONNECTION_TIMEOUT //");
        return;
      }

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        if (data && typeof data === "object" && "detail" in data) {
          const detail = (data as { detail: unknown }).detail;
          setInlineError(typeof detail === "string" ? detail : "AUTH_REJECTED //");
        } else {
          setInlineError("AUTH_REJECTED //");
        }
        return;
      }

      router.refresh();
      router.push(`/${lang}/portal/dashboard`);
    });
  }

  return (
    <>
      <header className={styles.header}>METIS // PORTAL_AUTH_GATEWAY</header>
      <div className={styles.formCard}>
        <div className={styles.formTitle}>LOGIN //</div>
        <form onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              EMAIL //
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              required
              disabled={isPending}
              autoComplete="email"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              PASSWORD //
            </label>
            <div className={styles.passwordRow}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                required
                disabled={isPending}
                autoComplete="current-password"
                minLength={8}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((value) => !value)}
                disabled={isPending}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "HIDE //" : "SHOW //"}
              </button>
            </div>
          </div>
          <button type="submit" className={styles.submitButton} disabled={isPending}>
            {isPending ? "AUTHENTICATING //" : "SUBMIT_CREDENTIALS //"}
          </button>
          {inlineError ? <p className={styles.inlineError}>{inlineError}</p> : null}
        </form>
        <p className={styles.footerLink}>
          <Link href={`/${lang}/portal/register`}>REGISTER_NEW_OPERATOR //</Link>
        </p>
      </div>
    </>
  );
}
