# Деплой RiskLens

Проект состоит из трех частей:

- `apps/web` - сайт на Next.js.
- `apps/api` - API на Fastify.
- PostgreSQL - база данных для Prisma.

Самая простая бесплатная схема:

- GitHub - хранит код.
- Neon - бесплатная PostgreSQL-база.
- Render - API.
- Vercel - сайт.

## 1. Подготовить GitHub

Создайте пустой репозиторий на GitHub, например `risklens`.

Затем в папке проекта выполните:

```bash
git init
git add .
git commit -m "Initial RiskLens deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/risklens.git
git push -u origin main
```

## 2. Создать базу Neon

1. Создайте проект в Neon.
2. Скопируйте строку подключения PostgreSQL.
3. Она понадобится как переменная `DATABASE_URL`.

## 3. Задеплоить API на Render

В Render создайте новый Web Service из GitHub-репозитория.

Настройки:

- Build Command: `npm install && npm run build -w @risklens/shared && npm run build -w @risklens/api && npm run db:deploy -w @risklens/api`
- Start Command: `npm run start -w @risklens/api`
- Health Check Path: `/health`

Переменные окружения:

```text
DATABASE_URL=<строка подключения Neon>
JWT_SECRET=<любой длинный случайный секрет>
WEB_ORIGIN=https://<ваш-сайт-на-vercel>.vercel.app
PORT=4000
```

После деплоя Render даст URL API, например:

```text
https://risklens-api.onrender.com
```

## 4. Задеплоить сайт на Vercel

В Vercel импортируйте тот же GitHub-репозиторий.

Настройки проекта:

- Framework Preset: Next.js
- Root Directory: `apps/web`
- Build Command: `cd ../.. && npm run build -w @risklens/shared && npm run build -w @risklens/web`
- Install Command: `cd ../.. && npm install`

Переменная окружения:

```text
NEXT_PUBLIC_API_URL=https://<ваш-api-на-render>.onrender.com
```

После первого деплоя скопируйте URL сайта Vercel и вернитесь в Render, чтобы обновить:

```text
WEB_ORIGIN=https://<ваш-сайт-на-vercel>.vercel.app
```

Затем перезапустите API на Render.
