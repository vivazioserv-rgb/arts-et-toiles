"use client";
import { useState, useEffect } from "react";
import { siteConfig } from "@/site.config";
import { COOKIE_KEY } from "@/lib/storage";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--accent)] bg-[var(--background)] p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p className="text-xs text-[var(--foreground)]/70">
          Ce site utilise des cookies essentiels. En poursuivant, vous acceptez leur utilisation.
        </p>
        <button onClick={accept} className="rounded-sm bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--background)] hover:bg-[var(--primary-dark)]">
          Accepter
        </button>
      </div>
    </div>
  );
}