"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAvatar } from "@/app/compte/(espace)/actions";
import { BusyLabel } from "./Loader";

// Recadrage carré au centre + réduction à 256 px en JPEG, directement sur le téléphone (envoi léger, rapide).
async function toSquareJpeg(file: File, size = 256): Promise<string> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(bmp.width, bmp.height);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, size, size);
  return c.toDataURL("image/jpeg", 0.86);
}

type Save = (dataUrl: string | null) => Promise<{ ok?: boolean; error?: string }>;
export default function AvatarField({ avatar, name, save: saveFn = saveAvatar, hint = "Elle s'affiche dans votre espace. Recadrée automatiquement." }: { avatar: string | null; name: string; save?: Save; hint?: string }) {
  const [src, setSrc] = useState(avatar);
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function save(next: string | null) {
    setMsg({});
    start(async () => {
      const r = await saveFn(next);
      if (r.error) { setMsg({ error: r.error }); return; }
      setSrc(next); setMsg({ ok: next ? "Photo enregistrée ✓" : "Photo retirée" }); router.refresh();
    });
  }
  async function onFile(f?: File) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setMsg({ error: "Choisissez une image." }); return; }
    if (f.size > 25 * 1024 * 1024) { setMsg({ error: "Image trop lourde (25 Mo maximum)." }); return; }
    try { save(await toSquareJpeg(f)); } catch { setMsg({ error: "Image illisible. Essayez une autre photo." }); }
  }

  return (
    <div className="avatar-field">
      <button type="button" className="avatar-big" onClick={() => input.current?.click()} aria-label="Changer ma photo de profil" disabled={pending}>
        {src ? <img src={src} alt="" width={96} height={96} /> : <span aria-hidden="true">{name.slice(0, 1).toUpperCase() || "?"}</span>}
        <span className="avatar-edit" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
        </span>
      </button>
      <div>
        <strong>Photo de profil</strong>
        <p className="muted" style={{ margin: "2px 0 10px", fontSize: ".9rem" }}>{hint}</p>
        <div className="trip-actions" style={{ margin: 0 }}>
          <button type="button" className="btn small" onClick={() => input.current?.click()} disabled={pending}><BusyLabel busy={pending} busyText="Envoi…">{src ? "Changer la photo" : "Ajouter une photo"}</BusyLabel></button>
          {src && <button type="button" className="btn small ghost" onClick={() => save(null)} disabled={pending}>Retirer</button>}
        </div>
        {msg.error && <p className="error" role="alert">{msg.error}</p>}
        {msg.ok && <p className="muted" role="status" style={{ marginTop: 8 }}>{msg.ok}</p>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}
