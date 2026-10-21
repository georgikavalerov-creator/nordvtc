"use client";
import { useEffect, useState } from "react";

// Numéro des mentions légales : assemblé côté navigateur, absent du HTML brut (anti-collecte automatique).
export default function PhoneShield({ rev }: { rev: string }) {
  const [n, setN] = useState("");
  useEffect(() => setN(rev.split("").reverse().join("")), [rev]);
  if (!n) return <span aria-hidden="true">…</span>;
  return <a href={`tel:${n.replace(/\s/g, "")}`}>{n}</a>;
}
