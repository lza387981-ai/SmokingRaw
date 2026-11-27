export async function onRequestGet({ params, env }) {
  const id = String(params.id || "");
  if (!/^[a-f0-9]{32}$/.test(id))
    return Response.json({ error: "Некорректная ссылка" }, { status: 400 });
  const row = await env.DB.prepare(
    "SELECT items_json, total, created_at FROM shared_carts WHERE id = ?"
  ).bind(id).first();
  if (!row) return Response.json({ error: "Корзина не найдена или ссылка устарела" }, { status: 404 });
  let items;
  try { items = JSON.parse(row.items_json); } catch {
    return Response.json({ error: "Не удалось прочитать корзину" }, { status: 500 });
  }
  return Response.json({ items, total: row.total, created_at: row.created_at });
}
