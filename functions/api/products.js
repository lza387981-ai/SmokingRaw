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
  ).bind(p.name.trim(), clean(p.description), p.category.trim(), Number(p.price), safeUrl(p.image_url)).first();
  return Response.json({ ok: true, id: result.id }, { status: 201 });
}

export async function onRequestPut({ request, env }) {
  if (!authorized(request, env)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  const p = await request.json();
  if (!Number.isInteger(Number(p.id)) || !valid(p)) return Response.json({ error: "Проверь данные позиции" }, { status: 400 });
  const result = await env.DB.prepare(
    "UPDATE products SET name=?, description=?, category=?, price=?, image_url=? WHERE id=?"
  ).bind(p.name.trim(), clean(p.description), p.category.trim(), Number(p.price), safeUrl(p.image_url), Number(p.id)).run();
  if (!result.meta?.changes) return Response.json({ error: "Позиция не найдена" }, { status: 404 });
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  if (!authorized(request, env)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  const p = await request.json();
  if (!Number.isInteger(Number(p.id))) return Response.json({ error: "Неверный ID" }, { status: 400 });
  const result = await env.DB.prepare("DELETE FROM products WHERE id=?").bind(Number(p.id)).run();
  if (!result.meta?.changes) return Response.json({ error: "Позиция не найдена" }, { status: 404 });
  return Response.json({ ok: true });
}

function authorized(r,e){return !!e.ADMIN_KEY && r.headers.get("X-Admin-Key") === String(e.ADMIN_KEY).trim();}
function valid(p){return p && typeof p.name==="string" && p.name.trim() && typeof p.category==="string" && p.category.trim() && Number.isFinite(Number(p.price)) && Number(p.price)>=0;}
function clean(v){return String(v||"").trim().slice(0,2000);}
function safeUrl(u){if(!u)return "";try{const x=new URL(u);return x.protocol==="https:"?x.href:"";}catch{return "";}}
