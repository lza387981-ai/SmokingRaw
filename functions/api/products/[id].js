export async function onRequestPut({ request, env, params }) {
  if (!authorized(request, env)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  const p = await request.json();
  if (!valid(p)) return Response.json({ error: "Некорректные данные" }, { status: 400 });
  const r = await env.DB.prepare("UPDATE products SET name=?, description=?, category=?, price=?, image_url=? WHERE id=?")
    .bind(p.name.trim(), (p.description||"").trim(), p.category.trim(), Number(p.price), safeUrl(p.image_url), Number(params.id)).run();
  return Response.json({ ok: true, changes: r.meta.changes });
}
export async function onRequestDelete({ request, env, params }) {
  if (!authorized(request, env)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  await env.DB.prepare("DELETE FROM products WHERE id=?").bind(Number(params.id)).run();
  return Response.json({ ok: true });
}
function authorized(r,e){return !!e.ADMIN_KEY && r.headers.get("X-Admin-Key") === e.ADMIN_KEY;}
function valid(p){return p && typeof p.name==="string" && p.name.trim() && typeof p.category==="string" && p.category.trim() && Number.isFinite(Number(p.price)) && Number(p.price)>=0;}
function safeUrl(u){if(!u)return "";try{const x=new URL(u);return x.protocol==="https:"?x.href:"";}catch{return "";}}
