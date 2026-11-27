export async function onRequestPost({ request, env }) {
  if (!env.BOT_TOKEN || !env.WEBHOOK_SECRET || !env.SETUP_KEY) {
    return Response.json({ error: "Не настроены BOT_TOKEN, WEBHOOK_SECRET и SETUP_KEY" }, { status: 500 });
  }

  const setupKey = String(env.SETUP_KEY).trim();
  const authorization = String(request.headers.get("Authorization") || "").trim();
  if (authorization !== `Bearer ${setupKey}`) {
    return Response.json({ error: "SETUP_KEY не совпадает. Проверь, что Secret сохранён в Production окружении проекта smokingraw." }, { status: 403 });
  }

  const webhookSecret = String(env.WEBHOOK_SECRET).trim();
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(webhookSecret)) {
    return Response.json({ error: "WEBHOOK_SECRET должен содержать только латинские буквы, цифры, _ и -" }, { status: 500 });
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
