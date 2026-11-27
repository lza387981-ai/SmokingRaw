const WEBHOOK_SECRET = "WEBHOOK_SECRET";

export async function onRequestPost({ request, env }) {
  if (!env.BOT_TOKEN || !env.WEBHOOK_SECRET) {
    return Response.json({ error: "Не настроены BOT_TOKEN и WEBHOOK_SECRET" }, { status: 500 });
  }

  if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.WEBHOOK_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = String(message?.text || "").trim();

  if (!chatId || !text) return Response.json({ ok: true });

  let reply;
  if (text === "/start" || text.startsWith("/start ")) {
    reply = "Привет! Это технический бот SmokingRaw.\n\nКоманды:\n/help — помощь по работе бота и сайта\n/status — проверить связь с ботом";
  } else if (text === "/help") {
    reply = "Если возникла проблема с открытием сайта или работой бота, опиши её одним сообщением. Не отправляй пароли и коды доступа.";
  } else if (text === "/status") {
    reply = "Бот на связи.";
  } else {
    reply = "Я принимаю сообщения по техническим вопросам. Доступные команды: /help и /status.";
  }

  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: reply })
  });

  return Response.json({ ok: true });
}
