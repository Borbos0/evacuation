# Evacuation PWA

PWA-приложение для поиска транспортного средства на штрафстоянке. Работает как в браузере, так и устанавливается на мобильный телефон (требует HTTPS).

## Возможности

- **Поиск ТС по ГРЗ** - без авторизации, нормализация кириллицы (А123ВС77 = A123BC77)
- **Профиль** - данные пользователя и привязанное к нему транспортное средство со статусом
- **Оффлайн-страница** - через сервис-воркер (Serwist), только в продакшн-сборке
- **Админ-панель** - управление транспортными средствами через Bearer-токен

## Стек

| Слой      | Технология                                                      |
| --------- | --------------------------------------------------------------- |
| Фреймворк | Next.js 16 (App Router, Turbopack)                              |
| БД        | SQLite + Prisma 7 + `@prisma/adapter-better-sqlite3` (WAL mode) |
| Сессии    | iron-session v8 (зашифрованные cookie)                          |
| Валидация | Zod v4                                                          |
| Стили     | Tailwind CSS v4                                                 |
| PWA       | Serwist                                                         |
| Тесты     | Vitest                                                          |

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Скопировать пример и заполнить
cp .env.example .env.local

# 3. Применить схему БД
npx prisma db push

# 4. Заполнить тестовыми данными
npx tsx prisma/seed.ts

# 5. Запустить дев-сервер
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

## Переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# Путь к SQLite-базе данных
DATABASE_URL="file:./dev.db"

# Секрет для шифрования сессий (минимум 32 символа, ОБЯЗАТЕЛЬНО сменить в проде!)
SESSION_SECRET="your-super-secret-32-plus-chars-here!!"

# Время жизни сессии в секундах (604800 = 7 дней)
SESSION_TTL_SECONDS="604800"

# Секрет для Bearer-токена в /api/admin/* (ОБЯЗАТЕЛЬНО сменить в проде!)
ADMIN_SECRET="your-admin-secret"

# Базовый URL приложения (используется для CSRF-проверки в проде)
APP_URL="http://localhost:3000"

# Rate limiting
RATE_LIMIT_LOGIN_PER_MINUTE="5"
RATE_LIMIT_LOGIN_PER_HOUR="20"
RATE_LIMIT_SEARCH_PER_MINUTE="30"
```

> **Важно:** `SESSION_SECRET` и `ADMIN_SECRET` обязательно сменить перед деплоем в продакшн.

## Демо-данные

После `npx tsx prisma/seed.ts` создаются:

### Пользователи

| Логин  | Пароль     | Имя               |
| ------ | ---------- | ----------------- |
| `demo` | `demo1234` | Иван Петров       |
| `alex` | `alex1234` | Александр Смирнов |
| `kate` | `kate1234` | Екатерина Волкова |

### Транспортные средства

| ГРЗ         | Авто         | Статус          | Владелец |
| ----------- | ------------ | --------------- | -------- |
| `А123ВС77`  | Toyota Camry | На штрафстоянке | demo     |
| `В456ЕК99`  | BMW X5       | Выдано          | alex     |
| `О777РР777` | -            | На штрафстоянке | kate     |
| `Х001АА50`  | Lada Vesta   | Неизвестно      | -        |

## API

### Публичные (без авторизации)

| Метод  | URL                                   | Описание                      |
| ------ | ------------------------------------- | ----------------------------- |
| `POST` | `/api/auth/login`                     | Вход (поле `login`, не email) |
| `POST` | `/api/auth/logout`                    | Выход                         |
| `GET`  | `/api/vehicles/search?plate=А123ВС77` | Поиск ТС по ГРЗ               |

### Требуют авторизации

| Метод | URL       | Описание             |
| ----- | --------- | -------------------- |
| `GET` | `/api/me` | Текущий пользователь |

### Админ (Bearer-токен = `ADMIN_SECRET`)

| Метод    | URL                        | Описание       |
| -------- | -------------------------- | -------------- |
| `GET`    | `/api/admin/vehicles`      | Список всех ТС |
| `POST`   | `/api/admin/vehicles`      | Добавить ТС    |
| `PUT`    | `/api/admin/vehicles/[id]` | Обновить ТС    |
| `DELETE` | `/api/admin/vehicles/[id]` | Удалить ТС     |

```bash
curl -H "Authorization: Bearer your-admin-secret" http://localhost:3000/api/admin/vehicles
```

## Структура проекта

```
src/
├── app/                  # Next.js App Router страницы и API-роуты
│   ├── api/              # REST API
│   ├── admin/vehicles/   # Админ-панель
│   ├── login/            # Страница входа
│   ├── profile/          # Профиль пользователя
│   └── sw.ts             # Service Worker (Serwist)
├── features/
│   └── auth/             # AuthProvider (клиентский контекст авторизации)
├── proxy.ts              # Middleware авторизации (Next.js 16)
├── server/
│   ├── auth/             # Сессии, getCurrentUser
│   ├── config/env.ts     # Zod-валидация env-переменных
│   ├── db/client.ts      # Prisma singleton + WAL mode
│   ├── repositories/     # Запросы к БД
│   └── security/         # CSRF, rate limiter, admin auth
└── shared/
    ├── lib/normalize-plate.ts  # Нормализация ГРЗ
    └── ui/Navigation.tsx       # Навигация
```

## Тесты

```bash
npm test
```

Покрыто: нормализация ГРЗ (`src/shared/lib/__tests__/normalize-plate.test.ts`).

## Сборка

```bash
npm run build
npm run start
```

## Безопасность

- `normalizedPlate` и `id` ТС никогда не возвращаются клиенту
- CSRF-проверка в продакшн (сравнение `Origin`/`Referer` с `APP_URL`), в dev отключена
- Rate limiting на логин и поиск (in-memory, сбрасывается при перезапуске)
- Сессия - зашифрованный cookie (AES-256-GCM), сервер не хранит состояние

## PWA и мобильный доступ

Для разработки с телефона в локальной сети:

1. Узнать IP машины: `ipconfig` → IPv4-адрес
2. Обновить `.env.local`: `APP_URL="http://192.168.x.x:3000"`
3. Убедиться что в `next.config.ts` прописан `allowedDevOrigins: ['192.168.x.x']`
4. Открыть `http://192.168.x.x:3000` на телефоне

Для установки PWA на телефон требуется HTTPS (Let's Encrypt + VPS или белый IP с сертификатом).
