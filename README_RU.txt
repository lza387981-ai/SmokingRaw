SmokingRaw v0.7 — сайт + D1 API + админка + загрузка фото в R2

НОВОЕ:
- загрузка JPG/PNG/WebP до 5 МБ через защищённый API;
- хранение фото в Cloudflare R2;
- отображение фото из image_url в каталоге;
- публичная ссылка на владельца берётся из D1 settings и показывается внизу каталога.

НАСТРОЙКА:
1. Создай D1 database smokingraw-db и выполни schema.sql.
2. Создай R2 bucket smokingraw-images.
3. В Pages → Settings → Functions добавь D1 binding: DB → smokingraw-db.
4. Добавь R2 binding: IMAGES → smokingraw-images.
5. Настрой публичный домен R2 и добавь переменную R2_PUBLIC_URL (например https://images.example.com).
6. Добавь ADMIN_KEY как Secret в Pages → Settings → Variables and Secrets.
7. Подключи GitHub-репозиторий к Cloudflare Pages. Build command оставь пустым, Build output directory укажи web. Папка functions должна оставаться в корне репозитория (рядом с web).
8. Открой /admin.html, введи ADMIN_KEY и добавляй товары с фотографиями.

ОГРАНИЧЕНИЯ:
- Исходники подготовлены, но сайт не опубликован и Cloudflare не настроен автоматически.
- Pages Functions требуют Git-интегрированный деплой или Wrangler; drag-and-drop статических файлов недостаточно.
- При замене фото старые объекты R2 автоматически не удаляются.
- Контакт владельца показывается, если заполнен в админке.
- Корзина и избранное пока хранятся локально.
- Telegram-бот ещё не подключён. BotFather token нельзя помещать во фронтенд.
