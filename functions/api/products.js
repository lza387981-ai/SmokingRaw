export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, description, category, price, image_url FROM products ORDER BY id DESC"
  ).all();
  return Response.json({ products: results || [] });
}
export async function onRequestPost({ request, env }) {
  if (!authorized(request, env)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  const p = await request.json();
  if (!valid(p)) return Response.json({ error: "Проверь название, категорию и цену" }, { status: 400 });
  const result = await env.DB.prepare(
    "INSERT INTO products (name, description, category, price, image_url) VALUES (?, ?, ?, ?, ?) RETURNING id"
  ).bind(p.name.trim(), (p.description || "").trim(), p.category.trim(), Number(p.price), safeUrl(p.image_url)).first();
  return Response.json({ ok: true, id: result.id }, { status: 201 });
}
function authorized(r,e){return !!e.ADMIN_KEY && r.headers.get("X-Admin-Key") === e.ADMIN_KEY;}
function valid(p){return p && typeof p.name==="string" && p.name.trim() && typeof p.category==="string" && p.category.trim() && Number.isFinite(Number(p.price)) && Number(p.price)>=0;}
function safeUrl(u){if(!u)return "";try{const x=new URL(u);return x.protocol==="https:"?x.href:"";}catch{return "";}}
