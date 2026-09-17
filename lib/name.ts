// Хелперы для работы с отображаемыми именами пользователей.
//
// Проблема: при импорте/создании части аккаунтов РОДИТЕЛЕЙ/УЧЕНИКОВ в поле
// User.name сохранялись бессмысленные значения — "." (длина 1, не проходит
// валидацию регистрации), ",", пустая строка или служебное слово "Majburiy"
// (узб. «обязательно»). В сайдбаре такое имя отображалось как пустая точка.
//
// Эти функции — единая точка проверки: валидация при создании (app/actions.ts)
// и защитный fallback при отображении (sidebar, app-layout, страницы ученика).
// Чистые функции, можно использовать и на сервере, и в клиентских компонентах.

/** Строка, состоящая только из пробелов/пунктуации/символов (".", ",", "-" и т.п.). */
const ONLY_PUNCT_OR_SPACES = /^[\s\p{P}\p{S}]+$/u;

/** Известные слова-заглушки, оставшиеся от импорта данных. */
const PLACEHOLDER_WORDS = new Set(['majburiy', 'required', 'name', 'fio', 'default', 'test', 'тест']);

/**
 * Считает имя «осмысленным», т.е. пригодным для показа пользователю:
 * - не пустое и не короче 2 символов;
 * - содержит минимум 2 буквы/цифры (отбрасывает ".", ",", "---" и т.п.);
 * - не является известным словом-заглушкой.
 */
export function isMeaningfulName(name: string | null | undefined): boolean {
  const trimmed = (name ?? '').trim();
  if (trimmed.length < 2) return false;
  if (ONLY_PUNCT_OR_SPACES.test(trimmed)) return false;

  const alnum = trimmed.replace(/[^\p{L}\p{N}]/gu, '');
  if (alnum.length < 2) return false;

  const words = trimmed.toLowerCase().split(/\s+/);
  if (words.length > 0 && words.every((w) => PLACEHOLDER_WORDS.has(w))) return false;

  return true;
}

/**
 * Возвращает читаемое имя, а если оно пустое/бессмысленное — заданный fallback.
 * Полезно в сайдбаре/хэдере, чтобы вместо "." пользователь видел «Пользователь».
 */
export function getDisplayName(name: string | null | undefined, fallback: string): string {
  if (isMeaningfulName(name)) return (name as string).trim();
  return fallback;
}