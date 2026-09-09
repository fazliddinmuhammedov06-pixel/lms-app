# Политика конфиденциальности — Friday Education LMS

**Статус:** готова к публикации в Google Play Console
**URL страницы:** `https://lms-app-tan-iota.vercel.app/privacy`
**Дата:** 10 сентября 2026 г.

## Краткое описание

Приложение «Friday Education» — система управления учебным центром (LMS). Обрабатываются только
данные, необходимые для работы учебного центра (учёт учеников, посещаемость, расписание, оплаты).
Реклама, трекеры и продажа данных третьим лицам отсутствуют.

## Что должно быть заполнено в Play Console → App content → Privacy Policy

- **Флаг:** «Yes, I have a privacy policy URL» — включён.
- **URL:** `https://lms-app-tan-iota.vercel.app/privacy`
- Страница доступна без авторизации (public SSR-страница `app/privacy/page.tsx`).

## Какие данные собирает приложение

| Данные | Зачем | Обязательность |
|---|---|---|
| Номер телефона (логин) | Аутентификация | Да |
| ФИО ученика/родителя/учителя | Учёт в центре | Да |
| Расписание, посещаемость, ДЗ, оценки | Основные функции LMS | Да |
| Сведения об оплате (сумма/статус) | Учёт платежей | Да |
| IP-адрес / тип устройства | Защита и стабильность | Автоматически |
| Платёжные данные карт | Не собираются | — |

Все данные хранятся в зашифрованной базе данных; пароли — только как bcrypt-хеши;
транспорт — HTTPS/TLS.

---

# Data Safety (Play Console → App content → Data safety)

Данные для заполнения формы **«Data safety»** в Google Play Console:

## 1. Обработка данных (Data types collected and shared)

Приложение **НЕ передаёт** данные третьим лицам, кроме оператора хостинга
(Vercel — хранение БД и статика). Трекеры/рекламные SDK отсутствуют.

## 2. Данные, которые собираются и не передаются другим пользователям

- **Approximate location** — НЕТ
- **Precise location** — НЕТ
- **Email** — НЕТ (электронная почта не запрашивается при входе)
- **Name** — ДА, «Name and other account info» (ФИО пользователей: директор, учителя, родители, ученики) — только для основных функций
- **Phone number** — ДА, «Personal info > Phone number» (телефон является логином) — только для основных функций
- **Photos/Videos** — НЕТ
- **Audio** — НЕТ
- **Files/Docs** — НЕТ
- **Contacts** — НЕТ
- **Messages** — НЕТ
- **Financial info > Credit/debit card numbers** — НЕТ (карты не запрашиваются)
- **Financial info > Other financial info** — ДА, «Purchase history» (суммы и даты оплат за обучение) — только для основных функций; платёжные реквизиты не хранятся
- **Health/Medical** — НЕТ
- **Calendar** — НЕТ
- **App activity > In-app search history** — НЕТ (поисковые запросы не сохраняются)
- **App activity > Other user-generated content** — ДА (домашние задания, комментарии, заявки на скидки) — только для основных функций
- **App activity > App interactions** — НЕТ
- **Performance > Crash logs / Diagnostics** — НЕТ (специальный сбор ошибок не настроен; при желании можно добавить, заполнив раздел вручную)

## 3. Single- or multi-role safety

- **Is privacy or security feature guaranteed?** — Нет: это внутренний инструмент учебного центра.
- **Данные под контролем пользователя?** — Учёт в Приложении (роль/профиль) создаёт администратор центра; родители и учителя используют учётные записи, предоставленные центром.

## 4. Security practices

- **Data encrypted in transit** — ДА (HTTPS/TLS).
- **Data encrypted at rest** — ДА (хеши паролей bcrypt; БД в дата-центре Vercel).
- **User can request data deletion** — ДА (обращаться к администратору центра, см. политику конфиденциальности).

## 5. Требования Target API (актуально на сентябрь 2026)

- **targetSdkVersion = 36** (Android 16) — соответствует требованию Google Play «Target API level 36» для новых приложений и обновлений с 31 августа 2026 г.
- **compileSdkVersion = 36**, **minSdkVersion = 30** (Android 11+).

## 6. Другие формы Play Console (App content)

- **Ads** — No (реклама отсутствует, рекламных SDK нет).
- **Content guidelines** — учебный инструмент, без контента для взрослых.
- **News apps** — No.
- **Government apps / Health apps** — No.
- **Device state / Health & Fitness / VPN / Device-and-App Abuse / Declare form** — не применимо.