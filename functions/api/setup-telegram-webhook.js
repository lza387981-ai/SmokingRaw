export async function onRequestPost({ request, env }) {
  if (!env.BOT_TOKEN || !env.WEBHOOK_SECRET || !env.SETUP_KEY) {
    return Response.json({ error: "Не настроены BOT_TOKEN, WEBHOOK_SECRET и SETUP_KEY" }, { status: 500 });
  }

  const setupKey = String(env.SETUP_KEY).trim();
  const authorization = String(request.headers.get("Authorization") || "").trim();
  if (authorization !== `Bearer ${setupKey}`) {
    return Response.json({ error: "SETUP_KEY не совпадает. Проверь, что Secret сохранён в Production окружении проекта smokingraw." }, { status: 403 });
  }

  const rawWebhookSecret = String(env.WEBHOOK_SECRET);
  const webhookSecret = rawWebhookSecret.trim();
  const invalidChars = [...webhookSecret].map((char, index) => ({ char, index, code: "U+" + char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0") })).filter(item => !/[A-Za-z0-9_-]/.test(item.char));
  if (webhookSecret.length < 1 || webhookSecret.length > 256 || invalidChars.length > 0) {
    return Response.json({
      error: "WEBHOOK_SECRET не проходит проверку",
      length: webhookSecret.length,
      invalidCharacters: invalidChars.map(({ index, code }) => ({ index, code }))
    }, { status: 500 });
  }

  const webhookUrl = new URL("/api/telegram-webhook", request.url).toString();
  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: webhookSecret,
      allowed_updates: ["message"],
      drop_pending_updates: true
    })
  });

  const result = await response.json();
  return Response.json(result, { status: response.ok ? 200 : 502 });
}
