# 🚀 Быстрый старт для нового пользователя

## Минимальная инструкция (3 шага)

### 1️⃣ Установить зависимости

```bash
yarn install
```

или

```bash
npm install
```

### 2️⃣ Запустить приложение

```bash
npm run dev
```

### 3️⃣ Открыть браузер

```
http://localhost:3000
```

**Вот и всё!** 🎉

---

## ❓ Часто задаваемые вопросы

### Q: Нужно ли создавать .env файл?

**A: НЕТ!** Приложение работает из коробки. Все необходимые настройки уже есть в `apps/saas-app/.env`.

### Q: Какой backend используется?

**A:** Реальный Cyoda backend на `https://cyoda-develop.kube3.cyoda.org`

Vite автоматически проксирует все API запросы на этот сервер.

### Q: Что делать, если порт 3000 занят?

**A:** Vite автоматически выберет другой порт (3001, 3002, и т.д.). Смотрите в консоли:

```
VITE v6.4.1  ready in 139 ms

➜  Local:   http://localhost:3001/
```

### Q: Где находится конфигурация?

**A:** В файле `apps/saas-app/.env`:

```bash
VITE_APP_API_BASE=/api
VITE_APP_API_BASE_PROCESSING=
VITE_APP_BASE_URL=https://cyoda-develop.kube3.cyoda.org/
```

### Q: Нужно ли запускать локальный backend?

**A: НЕТ!** Приложение работает с удалённым backend через Vite proxy.

### Q: Что такое корневой .env.development.local?

**A:** Это файл для standalone разработки отдельных пакетов. **SaaS app его НЕ использует.**

---

## 🔧 Дополнительные команды

```bash
# Сборка для production
npm run build:saas

# Запуск E2E тестов
npm run test:e2e

# Проверка типов
npm run type-check

# Линтинг
npm run lint
```

---

## 📂 Структура проекта

```
cyoda-saas-platform/
├── apps/
│   └── saas-app/              # 🎯 Главное приложение
│       ├── .env               # ✅ Конфигурация (используется)
│       ├── .env.example       # Шаблон
│       └── vite.config.ts     # Настройки Vite + Proxy
│
├── packages/                  # 📦 Переиспользуемые пакеты
│   ├── ui-lib-react/
│   ├── http-api-react/
│   ├── cyoda-sass-react/
│   ├── tableau-react/
│   ├── statemachine-react/
│   ├── tasks-react/
│   └── processing-manager-react/
│
├── .env.template              # Шаблон для всех пакетов
├── .env.development.local     # ⚠️ НЕ используется SaaS app
├── package.json               # Корневой package.json
└── README.md                  # Документация
```

---

## 🎯 Что важно понимать

### ✅ Используется SaaS app:

- `apps/saas-app/.env` - основная конфигурация
- `apps/saas-app/.env.development.local` - feature flags
- `apps/saas-app/vite.config.ts` - настройки Vite и proxy

### ❌ НЕ используется SaaS app:

- `.env.development.local` в корне проекта
- `.env.template` (это только шаблоны)
- `.env` файлы из `packages/*` (только для standalone режима)

---

## 🌐 Как работает подключение к backend

```
Browser (localhost:3000)
    ↓
    GET /api/some-endpoint
    ↓
Vite Proxy (vite.config.ts)
    ↓
    HTTPS GET https://cyoda-develop.kube3.cyoda.org/api/some-endpoint
    ↓
Cyoda Backend
    ↓
    Response
    ↓
Browser
```

**Преимущества:**
- ✅ Нет CORS проблем
- ✅ Не нужен локальный backend
- ✅ Работает с реальными данными
- ✅ Простая настройка

---

## 🐛 Решение проблем

### Проблема: Ошибки импорта пакетов

```bash
npm run build:saas-deps
```

### Проблема: Порт занят

Vite автоматически выберет другой порт. Или измените в `apps/saas-app/vite.config.ts`:

```typescript
server: {
  port: 3001,
}
```

### Проблема: Backend недоступен

Проверьте подключение:

```bash
curl https://cyoda-develop.kube3.cyoda.org/api
```

### Проблема: Старые зависимости

```bash
# Очистить всё
npm run clean
rm -rf node_modules
rm -rf yarn.lock

# Переустановить
yarn install
```

---

## 📚 Дополнительная документация

- **Полная документация:** `README.md`
- **SaaS App:** `apps/saas-app/README.md`
- **Порты:** `PORTS.md`
- **Env файлы:** `ENV_FILES_GUIDE.md`

---

## ✅ Чеклист для первого запуска

- [ ] Node.js >= 22.0.0 установлен
- [ ] Yarn >= 4.6.0 установлен (или npm >= 10.0.0)
- [ ] Выполнена команда `yarn install`
- [ ] Выполнена команда `npm run dev`
- [ ] Браузер открыт на `http://localhost:3000`
- [ ] Приложение загрузилось без ошибок

---

## 🎉 Готово!

Если всё работает, вы должны увидеть:

1. **В консоли Vite:**
   ```
   VITE v6.4.1  ready in XXX ms
   ➜  Local:   http://localhost:3000/
   ```

2. **В браузере:**
   - Страница логина или главная страница приложения
   - Нет ошибок в консоли браузера (F12)

3. **В консоли Vite (логи прокси):**
   ```
   Proxying: GET /api/... → https://cyoda-develop.kube3.cyoda.org/api/...
   Response: 200 GET /api/...
   ```

**Приятной работы!** 🚀

