export async function onRequestGet({ request, env }) {
  if (!authorized(request, env)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  await env.DB.prepare("DELETE FROM purchases WHERE datetime(expires_at) <= datetime('now')").run();
  const { results } = await env.DB.prepare(
    "SELECT code, items_json, total, created_at, expires_at, buyer_username, buyer_id FROM purchases WHERE datetime(expires_at) > datetime('now') ORDER BY datetime(created_at) DESC LIMIT 300"
  ).all();
  return Response.json({ purchases: (results || []).map(row => ({...row, items: JSON.parse(row.items_json)})) });
}
function authorized(request, env) {
  return !!env.ADMIN_KEY && request.headers.get("X-Admin-Key") === String(env.ADMIN_KEY).trim();
}
