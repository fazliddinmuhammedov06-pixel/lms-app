import { StudentLevel } from '@/types';

// Пороги уровней
const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Новичок', minStars: 0 },
  { level: 2, name: 'Ученик', minStars: 100 },
  { level: 3, name: 'Знаток', minStars: 250 },
  { level: 4, name: 'Мастер', minStars: 500 },
  { level: 5, name: 'Эксперт', minStars: 1000 },
];

/**
 * Вычисляет уровень ученика по общему количеству заработанных звёзд
 * @param totalStars - общая сумма всех начисленных звёзд (не текущий баланс!)
 * @returns уровень от 1 до 5
 */
export function getLevelByStars(totalStars: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalStars >= LEVEL_THRESHOLDS[i].minStars) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1; // По умолчанию Новичок
}

/**
 * Возвращает название уровня по номеру
 * @param level - уровень от 1 до 5
 * @returns название уровня
 */
export function getLevelName(level: number): string {
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  return threshold?.name || 'Новичок';
}

/**
 * Вычисляет количество звёзд до следующего уровня
 * @param totalStars - общая сумма всех начисленных звёзд
 * @returns количество звёзд до следующего уровня или null, если достигнут максимальный уровень
 */
export function getStarsToNextLevel(totalStars: number): number | null {
  const currentLevel = getLevelByStars(totalStars);
  
  // Если достигнут максимальный уровень
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return null;
  }
  
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel]; // currentLevel - это индекс следующего уровня
  return nextThreshold.minStars - totalStars;
}

/**
 * Вычисляет прогресс до следующего уровня в процентах
 * @param totalStars - общая сумма всех начисленных звёзд
 * @returns процент прогресса от 0 до 100
 */
export function getProgressPercent(totalStars: number): number {
  const currentLevel = getLevelByStars(totalStars);
  
  // Если достигнут максимальный уровень
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 100;
  }
  
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel);
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
  
  if (!currentThreshold || !nextThreshold) {
    return 0;
  }
  
  const starsInCurrentLevel = totalStars - currentThreshold.minStars;
  const starsNeededForNextLevel = nextThreshold.minStars - currentThreshold.minStars;
  
  return Math.floor((starsInCurrentLevel / starsNeededForNextLevel) * 100);
}

/**
 * Возвращает полную информацию об уровне ученика
 * @param totalStars - общая сумма всех начисленных звёзд
 * @param currentBalance - текущий баланс звёзд (может быть меньше totalStars из-за трат)
 * @returns объект StudentLevel с полной информацией
 */
export function getStudentLevel(totalStars: number, currentBalance: number): StudentLevel {
  const level = getLevelByStars(totalStars);
  const levelName = getLevelName(level);
  const nextLevelStars = getStarsToNextLevel(totalStars);
  const progressPercent = getProgressPercent(totalStars);
  
  return {
    level,
    levelName,
    totalStars,
    currentBalance,
    nextLevelStars,
    progressPercent,
  };
}

/**
 * Вычисляет общее количество заработанных звёзд из транзакций
 * @param transactions - массив транзакций звёзд
 * @returns общая сумма только положительных начислений
 */
export function calculateTotalStarsEarned(transactions: { amount: number }[]): number {
  return transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Вычисляет текущий баланс звёзд из транзакций
 * @param transactions - массив транзакций звёзд
 * @returns сумма всех транзакций (включая списания)
 */
export function calculateCurrentBalance(transactions: { amount: number }[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}
