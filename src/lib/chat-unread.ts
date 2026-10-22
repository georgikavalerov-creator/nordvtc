import { db, dbConfigured } from "@/lib/supabase";

/** Conversations avec des messages du client pas encore lus par le chauffeur (pour le badge et la notification). */
export async function adminUnread() {
  if (!dbConfigured()) return { count: 0, messages: 0, latest: null as null | { id: string; name: string; body: string; at: string } };
  const { data } = await db().from("chat_threads").select("id,visitor_name,last_visitor_at,admin_seen_at").eq("closed", false).order("last_visitor_at", { ascending: false }).limit(100);
  const unread = (data ?? []).filter((t) => !t.admin_seen_at || new Date(t.last_visitor_at) > new Date(t.admin_seen_at));
  if (!unread.length) return { count: 0, messages: 0, latest: null };
  let messages = 0;
  for (const t of unread.slice(0, 20)) {
    const { count } = await db().from("chat_messages").select("id", { count: "exact", head: true }).eq("thread_id", t.id).eq("sender", "visitor").gt("created_at", t.admin_seen_at ?? "1970-01-01");
    messages += count ?? 0;
  }
  const top = unread[0];
  const { data: last } = await db().from("chat_messages").select("body,created_at").eq("thread_id", top.id).eq("sender", "visitor").order("id", { ascending: false }).limit(1).maybeSingle();
  return { count: unread.length, messages, latest: { id: top.id as string, name: (top.visitor_name as string) || "Visiteur", body: (last?.body as string) ?? "", at: (last?.created_at as string) ?? top.last_visitor_at } };
}
