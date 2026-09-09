// Единая нормализация телефонных номеров.
// Формат хранения и поиска в БД: канонический "+998XXXXXXXXX".
// Логин (lib/auth.ts), регистрация (app/api/auth/register) и создание пользователей
// (app/actions.ts) обязаны использовать этот согласованный формат, иначе аккаунт
// создаётся, но не может быть найден при входе.

/** Приводит номер к каноническому виду "+998XXXXXXXXX" или возвращает null, если номер не распознан. */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998')) return '+' + digits;
  if (digits.length === 9) return '+998' + digits;
  return null;
}

export const UZ_PHONE_REGEX = /^\+998\d{9}$/;

/** Проверяет, что номер уже в каноническом формате "+998XXXXXXXXX". */
export function isValidUzPhone(phone: string): boolean {
  return UZ_PHONE_REGEX.test(phone);
}