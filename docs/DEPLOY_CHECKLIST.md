# 🚀 Vercel Deploy Checklist — Friday Education LMS

Перед каждым деплоем на Production убедись, что в  
**Vercel Dashboard → Project → Settings → Environment Variables → Production**  
выставлены все переменные ниже.

---

## Обязательные переменные окружения (Production)

| Переменная | Пример / Формат | Описание |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require&pgbouncer=true&connection_limit=1` | Pooled-подключение к Postgres (через PgBouncer, если Supabase/Neon) |
| `DIRECT_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` | Прямое подключение — нужно Prisma для миграций |
| `NEXTAUTH_URL` | `https://lms-app-tan-iota.vercel.app` | Точный URL деплоя (без слеша в конце) |
| `AUTH_SECRET` | `openssl rand -base64 32` | Случайная строка ≥ 32 символа, секрет NextAuth |

---

## Как проверить

1. Открой [vercel.com](https://vercel.com) → твой проект `lms-app-tan-iota`
2. Перейди **Settings → Environment Variables**
3. Убедись что каждая переменная из таблицы выше:
   - присутствует в колонке **Production** ✅
   - не пустая ✅
   - не содержит кавычек вокруг значения ✅

---

## Важно: seed НЕ запускается автоматически

Build-скрипт (`package.json`) содержит только:
```
"build": "prisma generate && next build"
```
`prisma db seed` **не вызывается** при деплое.  
Запускать seed вручную нужно только один раз для инициализации новой БД:
```bash
npx prisma db seed
```

> ⚠️ **Никогда не запускай seed на production-БД с реальными данными** — он очищает все таблицы перед заполнением.

---

## Как создать AUTH_SECRET

```bash
# В терминале (Linux/Mac):
openssl rand -base64 32

# Или через Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## После добавления переменных

После добавления/изменения переменных в Vercel Dashboard необходимо  
**сделать новый деплой** (Deployments → Redeploy), чтобы изменения вступили в силу.
