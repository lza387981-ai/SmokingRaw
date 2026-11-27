export async function onRequestPost({ request, env }) {
  try {
    await env.DB.prepare(`DELETE FROM shared_carts WHERE datetime(created_at) <= datetime('now', '-35 minutes')`).run();
    const body = await request.json();
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50)
      return Response.json({ error: "Корзина должна содержать от 1 до 50 позиций" }, { status: 400 });
    const items = body.items.map(item => ({
      name: String(item.name || "").trim().slice(0, 160),
      price: Number(item.price),
      quantity: Math.max(1, Math.min(999, Math.floor(Number(item.quantity) || 1)))
    }));
    if (items.some(x => !x.name || !Number.isFinite(x.price) || x.price < 0))
      return Response.json({ error: "Некорректные данные корзины" }, { status: 400 });
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const id = crypto.randomUUID().replace(/-/g, "");
    await env.DB.prepare(
      "INSERT INTO shared_carts (id, items_json, total, created_at) VALUES (?, ?, ?, ?)"
    ).bind(id, JSON.stringify(items), total, new Date().toISOString()).run();
    return Response.json({ ok: true, id });
  } catch (error) {
    return Response.json({ error: "Не удалось сохранить корзину. Проверь, что таблица shared_carts создана в D1." }, { status: 500 });
  }
}
