# Следующие шаги для завершения LMS

## ✅ Что уже сделано

1. ✅ Инициализирован Next.js 14+ проект с TypeScript и Tailwind CSS
2. ✅ Создана Prisma схема базы данных (SQLite)
3. ✅ Реализована логика уровней учеников (`lib/levels.ts`)
4. ✅ Созданы TypeScript типы (`types/index.ts`)
5. ✅ Реализованы UI-компоненты для трех ролей:
   - `/` — главная страница с навигацией
   - `/director` — панель директора
   - `/teacher` — панель учителя
   - `/student` — панель ученика/родителя
6. ✅ База данных создана и готова к работе (`prisma/dev.db`)

## 🚀 Что нужно сделать дальше

### 1. Создать seed-данные для тестирования

Файл `prisma/seed.ts` с тестовыми пользователями:
- Директор, учителя, родители, ученики
- Группы и расписание
- Начальные транзакции звёзд

### 2. Настроить NextAuth.js

- Credentials provider для авторизации по email/паролю
- JWT токены с информацией о роли
- Страница входа `/login`

### 3. Создать middleware для защиты маршрутов

Ограничить доступ к страницам по ролям:
- `/director` — только DIRECTOR
- `/teacher` — только TEACHER
- `/student` — только PARENT

### 4. Реализовать Server Actions

Создать `app/actions.ts` с функциями:
- `markAttendance()` — отметка посещаемости
- `addStars()` — начисление звёзд
- `createDiscountRequest()` — создание заявки на скидку
- `approveDiscountRequest()` — одобрение заявки
- `rejectDiscountRequest()` — отклонение заявки

### 5. Настроить Web Push (опционально)

- Генерация VAPID ключей
- Service Worker для получения уведомлений
- Отправка push при пропуске занятия

## 📝 Полезные команды

```bash
# Запуск dev-сервера
npm run dev

# Просмотр БД через Prisma Studio
npx prisma studio

# Создание seed-данных
npx prisma db seed
```

## 📚 Документация

- [Next.js 14](https://nextjs.org/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
