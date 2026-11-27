export async function onRequestPost({ request, env }) {
  if (!env.BOT_TOKEN || !env.WEBHOOK_SECRET) {
    return Response.json({ error: "Не настроены BOT_TOKEN и WEBHOOK_SECRET" }, { status: 500 });
  }

  const webhookSecret = String(env.WEBHOOK_SECRET).trim();
  if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== webhookSecret) {
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
  const incoming = String(message?.text || "").trim();
  if (!chatId || !incoming) return Response.json({ ok: true });

  const text = incoming.toLowerCase().replace(/@[a-z0-9_]+/g, "").trim();
  const isStart = text === "/start" || text.startsWith("/start ");
  const isHelp = text === "/help";
  const isStatus = text === "/status";

  let reply;
  let replyMarkup;

  if (isStart) {
    reply = "Привет! Я бот SmokingRaw 👋\n\nМогу подсказать по работе сайта и приложения, помочь разобраться с ошибками или просто поддержать разговор.\n\nКоманды:\n/help — что я умею\n/status — проверить связь";
    replyMarkup = {
      inline_keyboard: [[{ text: "Открыть приложение", web_app: { url: "https://smokingraw.pages.dev" } }]]
    };
  } else if (isHelp) {
    reply = "Вот чем могу помочь:\n\n• Не открывается сайт — напиши, что именно видишь на экране.\n• Не работает кнопка или раздел — укажи, какой именно.\n• Проблема с ботом — пришли текст ошибки.\n\nТакже можешь задавать обычные вопросы. Не отправляй пароли и коды доступа.";
  } else if (isStatus) {
    reply = "На связи ✅ Telegram-бот отвечает. Это проверка связи с ботом; она не проверяет состояние всех разделов сайта.";
  } else if (/какаш|кака|💩|пук|привет|здравств|хай|hello|ку/.test(text)) {
    if (/какаш|кака|💩/.test(text)) {
      reply = "Запрос принят 💩😂 Чем ещё займёмся? Могу помочь с сайтом, приложением или просто поболтать.";
    } else {
      reply = "Привет! 👋 Что будем делать? Могу помочь с сайтом SmokingRaw, приложением или ответить на обычный вопрос.";
    }
  } else if (/не работ|ошибк|не откры|не груз|сломал|проблем|баг|вылет|завис/.test(text)) {
    reply = "Давай разберёмся. Напиши, пожалуйста, где проблема — на сайте, в приложении или в Telegram-боте — и что происходит. Если есть текст ошибки, скопируй его сюда. Пароли и коды не присылай.";
  } else if (/сайт|приложен|mini.?app|мини.?апп/.test(text)) {
    reply = "По приложению SmokingRaw помогу. Напиши, какой раздел или действие тебя интересует: открытие, интерфейс, профиль или ошибка.";
  } else if (text.length < 3) {
    reply = "Не совсем понял 🙃 Напиши чуть подробнее — постараюсь помочь.";
  } else {
    reply = "Понял тебя. Я пока не подключён к большой ИИ-модели, но могу помочь с сайтом и приложением. Напиши вопрос чуть подробнее — попробую разобраться.";
  }

  const payload = { chat_id: chatId, text: reply };
  if (replyMarkup) payload.reply_markup = replyMarkup;

  const telegramResponse = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!telegramResponse.ok) {
    return Response.json({ ok: false, telegram_status: telegramResponse.status }, { status: 502 });
  }
  return Response.json({ ok: true });
}
