export async function onRequestPost({ request, env }) {
  if (!env.BOT_TOKEN || !env.WEBHOOK_SECRET || !env.SETUP_KEY) {
    return Response.json({ error: "Не настроены BOT_TOKEN, WEBHOOK_SECRET и SETUP_KEY" }, { status: 500 });
  }

  if (request.headers.get("Authorization") !== `Bearer ${env.SETUP_KEY}`) {
    return new Response("Forbidden", { status: 403 });
  }

  const webhookUrl = new URL("/api/telegram-webhook", request.url).toString();
  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: env.WEBHOOK_SECRET,
      allowed_updates: ["message"],
      drop_pending_updates: true
    })
  });

  const result = await response.json();
  return Response.json(result, { status: response.ok ? 200 : 502 });
}
