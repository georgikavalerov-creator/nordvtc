"use client";
// Événements de conversion (sans cookie, sans donnée personnelle). Sans Plausible configuré, ne fait rien.
export function track(event: string, props?: Record<string, string | number>) {
  try {
    (window as unknown as { plausible?: (e: string, o?: { props: unknown }) => void }).plausible?.(event, props ? { props } : undefined);
  } catch { /* ignoré */ }
}
