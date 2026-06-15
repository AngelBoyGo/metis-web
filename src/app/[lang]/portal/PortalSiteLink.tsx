"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./auth.module.css";

type PortalSiteLinkProps = {
  label: string;
};

export default function PortalSiteLink({ label }: PortalSiteLinkProps) {
  const { lang } = useParams<{ lang: string }>();
  return (
    <Link href={`/${lang}`} className={styles.siteReturn}>
      {label}
    </Link>
  );
}
