export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_KEY || request.headers.get("X-Admin-Key") !== env.ADMIN_KEY)
    return Response.json({ error: "Нет доступа" }, { status: 401 });
  if (!env.IMAGES || !env.R2_PUBLIC_URL)
    return Response.json({ error: "Настрой R2 binding IMAGES и переменную R2_PUBLIC_URL" }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Файл не получен" }, { status: 400 });
  const allowed = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
  const ext = allowed.get(file.type);
  if (!ext) return Response.json({ error: "Разрешены только JPG, PNG и WebP" }, { status: 415 });
  if (file.size > 5 * 1024 * 1024) return Response.json({ error: "Максимальный размер файла — 5 МБ" }, { status: 413 });
  const key = `products/${crypto.randomUUID()}.${ext}`;
  await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
  const base = String(env.R2_PUBLIC_URL).replace(/\\/+$/, "");
  return Response.json({ ok: true, key, url: `${base}/${key}` }, { status: 201 });
}
