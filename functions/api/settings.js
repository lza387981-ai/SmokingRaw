export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key='owner_contact'").first();
  return Response.json({ owner_contact: row?.value || "" });
}
export async function onRequestPut({ request, env }) {
  if (!env.ADMIN_KEY || request.headers.get("X-Admin-Key") !== env.ADMIN_KEY)
    return Response.json({ error: "Нет доступа" }, { status: 401 });
  const body = await request.json();
  const value = String(body.owner_contact || "").replace(/^@/, "").trim().replace(/[^a-zA-Z0-9_]/g, "");
  await env.DB.prepare("INSERT INTO settings (key,value) VALUES ('owner_contact',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(value).run();
  return Response.json({ ok: true });
}
