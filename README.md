# Мой рацион (MyRation)

AI-платформа для похудения и правильного питания: рацион, калории, БЖУ, прогресс и персональные рекомендации.

## Стек

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Auth.js (с Этапа 3)
- OpenAI (с Этапов 7 и 9)
- Recharts (с Этапа 5/8)

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Скопируйте переменные окружения:

```bash
copy .env.example .env
```

3. Поднимите локальную БД (без установки PostgreSQL):

```bash
npm run db:up
npm run db:ls
```

На Windows в `.env` используйте `127.0.0.1` и актуальные порты из `db:ls`. Нужны оба URL: `DATABASE_URL` и `SHADOW_DATABASE_URL`.

4. Примените миграции и сгенерируйте клиент:

```bash
npm run db:migrate
npm run db:generate
npm run db:check
```

5. Запустите dev-сервер:

```bash
npm run dev -- -p 3001
```

Приложение: [http://localhost:3001](http://localhost:3001)  
Health: [http://localhost:3001/api/health](http://localhost:3001/api/health)

`AUTH_URL` и `NEXT_PUBLIC_APP_URL` должны совпадать с URL приложения.

## Скрипты проверки

```bash
npm run typecheck
npm run lint
npm run test
npm run smoke:all
npm run build
```

## Архитектура

| Слой | Путь | Ответственность |
|------|------|-----------------|
| UI | `src/components`, `src/app` | Страницы и компоненты |
| API | `src/app/api` | HTTP-обработчики без бизнес-логики |
| Domains | `src/modules/*` | Бизнес-логика по модулям |
| Infra | `src/lib` | Prisma, env, внешние SDK |
| DB | `prisma/` | Схема и миграции |
| Generated | `src/generated/prisma` | Prisma Client (не править вручную) |

> **Prisma 7:** URL БД задаётся в `prisma7.config.ts`, а runtime-подключение идёт через `@prisma/adapter-pg` + `pg` в `src/lib/prisma.ts`.

## Авторизация (Этап 3)

- Регистрация: `/register`
- Вход: `/login`
- Защищённый кабинет: `/dashboard`
- Сессии: Auth.js (JWT) + credentials
- Пароли: bcrypt, хранятся только как `passwordHash`

## Анкета и нормы (Этап 4)

- Онбординг: `/profile/onboarding`
- Профиль: `/profile`
- Формула: Mifflin–St Jeor + коэффициент активности + цель
- Сохраняется в `UserProfile` и `NutritionTarget`

## Dashboard (Этап 5)

- Страница: `/dashboard`
- Прогресс калорий/БЖУ/воды за сегодня vs нормы
- График веса (Recharts) по `WeightLog`
- Данные только из PostgreSQL, без mock

## Дневник питания (Этап 6)

- Страница: `/diary`
- Ручное добавление блюд с калориями и БЖУ
- Группировка по приёмам пищи, удаление записей
- Итоги дня сразу отражаются на dashboard

## AI-фотодневник (Этап 7)

- Страница: `/photo-diary`
- Загрузка фото → OpenAI Vision → проверка БЖУ → запись в дневник
- Без `OPENAI_API_KEY` показывается понятное сообщение (без имитации успеха)
- Фото сохраняются в `public/uploads/food`

## Вес и вода (Этап 8)

- Вес: `/weight` — замеры, история, график, обновление веса в анкете
- Вода: `/water` — быстрые кнопки + свой объём, прогресс к дневной норме
- Данные сразу отражаются на `/dashboard`

## AI-помощник (Этап 9)

- Страница: `/assistant`
- Персональные ответы с учётом анкеты, норм, дневника, воды и веса
- История диалогов в PostgreSQL
- Без `OPENAI_API_KEY` — понятное сообщение, без имитации

## Тестирование и запуск (Этап 10)

### Локальный чек-лист

1. `npm run db:up` → обновить порты в `.env` из `npm run db:ls`
2. `npm run db:migrate` / `npm run db:check`
3. Заполнить `AUTH_SECRET` и при необходимости `OPENAI_API_KEY`
4. `npm run check` (typecheck + lint)
5. `npm run test` (юнит: Mifflin–St Jeor + промпт ассистента)
6. `npm run smoke:all` (auth → profile → dashboard → diary → food → weight/water → assistant)
7. `npm run build`
8. Открыть `/api/health` — `databaseReachable: true`, `authSecretConfigured: true`

### Переменные для продакшена

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | PostgreSQL (managed) |
| `AUTH_SECRET` | секрет сессий Auth.js |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | публичный HTTPS URL |
| `OPENAI_API_KEY` | AI-фотодневник и AI-помощник |

### Деплой (Vercel + Postgres)

1. Создайте Postgres и задайте `DATABASE_URL` в окружении проекта.
2. Перед стартом приложения: `npx prisma migrate deploy`.
3. Выставьте `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `OPENAI_API_KEY`.
4. Учтите: локальные загрузки в `public/uploads/food` на serverless не персистентны — для продакшена нужен object storage (S3/Blob). Без него AI-фотодневник работает локально.

### Smoke-скрипты

| Команда | Что проверяет |
|---------|---------------|
| `smoke:auth` | регистрация пользователя + bcrypt |
| `smoke:profile` | анкета и нормы |
| `smoke:dashboard` | агрегаты дня |
| `smoke:diary` | записи еды |
| `smoke:food-estimate` | оценка калорий по названию |
| `smoke:weight-water` | вес и вода |
| `smoke:assistant` | треды и сообщения AI |
| `smoke:all` | полный прогон |

## Этапы

1. Окружение и каркас — готово
2. База данных — готово
3. Регистрация и авторизация — готово
4. Анкета и нормы питания — готово
5. Dashboard — готово
6. Дневник питания — готово
7. AI-фотодневник — готово
8. Контроль веса и воды — готово
9. AI-помощник — готово
10. Тестирование и подготовка к запуску — готово
