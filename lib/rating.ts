import { prisma } from '@/lib/prisma';
import { calculateTotalStarsEarned } from '@/lib/levels';

export interface LeaderboardStudent {
  id: string;
  rank: number;
  name: string;
  stars: number;
  totalEarned: number;
  change: number;
  groupName: string;
  isCurrentStudent: boolean;
}

export interface StudentAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progressText: string;
}

export interface StudentProfileRating {
  rank: number;
  totalStudents: number;
  stars: number;
  totalEarned: number;
  change: number;
  starsToNextRank: number | null;
  nextRankNumber: number | null;
}

export async function getLeaderboardData(currentStudentId?: string) {
  const students = await prisma.student.findMany({
    where: currentStudentId
      ? { OR: [{ NOT: { status: 'LEFT' } }, { id: currentStudentId }] }
      : { NOT: { status: 'LEFT' } },
    select: {
      id: true,
      name: true,
      stars: true,
      group: { select: { name: true } },
      starTransactions: { select: { amount: true, createdAt: true } },
      attendanceRecords: { select: { status: true, date: true }, orderBy: { date: 'desc' } },
      grades: { select: { gradeInt: true } },
    },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const processed = students.map((st) => {
    const totalEarned = calculateTotalStarsEarned(st.starTransactions || []);
    const effectiveStars = Math.max(st.stars || 0, totalEarned);
    const recentTxSum = (st.starTransactions || [])
      .filter((tx) => new Date(tx.createdAt) >= sevenDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const stars7DaysAgo = Math.max(0, effectiveStars - recentTxSum);

    return {
      id: st.id,
      name: st.name,
      stars: st.stars || 0,
      totalEarned,
      effectiveStars,
      stars7DaysAgo,
      groupName: st.group?.name || 'Без группы',
      attendanceRecords: st.attendanceRecords || [],
      grades: st.grades || [],
    };
  });

  const currentSorted = [...processed].sort((a, b) => {
    if (b.effectiveStars !== a.effectiveStars) return b.effectiveStars - a.effectiveStars;
    if (b.totalEarned !== a.totalEarned) return b.totalEarned - a.totalEarned;
    return a.name.localeCompare(b.name);
  });

  const oldSorted = [...processed].sort((a, b) => {
    if (b.stars7DaysAgo !== a.stars7DaysAgo) return b.stars7DaysAgo - a.stars7DaysAgo;
    return a.name.localeCompare(b.name);
  });

  const oldRankMap = new Map<string, number>();
  oldSorted.forEach((st, idx) => oldRankMap.set(st.id, idx + 1));

  const leaderboard: LeaderboardStudent[] = currentSorted.map((st, idx) => {
    const rank = idx + 1;
    const oldRank = oldRankMap.get(st.id) || rank;
    return {
      id: st.id,
      rank,
      name: st.name,
      stars: st.stars,
      totalEarned: st.totalEarned,
      change: oldRank - rank,
      groupName: st.groupName,
      isCurrentStudent: st.id === currentStudentId,
    };
  });

  let currentProfileRating: StudentProfileRating | null = null;
  let achievements: StudentAchievement[] = [];

  if (currentStudentId) {
    const currentIdx = currentSorted.findIndex((s) => s.id === currentStudentId);
    if (currentIdx !== -1) {
      const cur = currentSorted[currentIdx];
      const rank = currentIdx + 1;
      const oldRank = oldRankMap.get(cur.id) || rank;
      const change = oldRank - rank;
      let starsToNextRank: number | null = null;
      let nextRankNumber: number | null = null;

      if (currentIdx > 0) {
        const above = currentSorted[currentIdx - 1];
        const diff = above.effectiveStars - cur.effectiveStars;
        starsToNextRank = diff > 0 ? diff : 1;
        nextRankNumber = currentIdx;
      }

      currentProfileRating = {
        rank,
        totalStudents: currentSorted.length,
        stars: cur.stars,
        totalEarned: cur.totalEarned,
        change,
        starsToNextRank,
        nextRankNumber,
      };

      const starsVal = Math.max(cur.stars, cur.totalEarned);
      const recentAtt = cur.attendanceRecords.slice(0, 7);
      const absents = recentAtt.filter((a) => a.status === 'ABSENT').length;
      const streakOk = recentAtt.length >= 7 && absents === 0;
      const countFives = cur.grades.filter((g) => g.gradeInt === 5).length;

      achievements = [
        { id: 's100', title: '100 ⭐', description: 'Набрать 100 звёзд', icon: '⭐', unlocked: starsVal >= 100, progressText: `${Math.min(starsVal, 100)} / 100` },
        { id: 's500', title: '500 ⭐', description: 'Набрать 500 звёзд', icon: '🌟', unlocked: starsVal >= 500, progressText: `${Math.min(starsVal, 500)} / 500` },
        { id: 's1000', title: '1000 ⭐', description: 'Набрать 1000 звёзд', icon: '👑', unlocked: starsVal >= 1000, progressText: `${Math.min(starsVal, 1000)} / 1000` },
        { id: 'st7', title: '7 дней без пропусков', description: '7 занятий подряд без пропусков', icon: '🔥', unlocked: streakOk, progressText: recentAtt.length >= 7 ? (streakOk ? '7 / 7' : `${7 - absents} / 7`) : `${recentAtt.length - absents} / 7` },
        { id: 'g10', title: '10 отличных оценок', description: 'Получить 10 оценок «5»', icon: '🎯', unlocked: countFives >= 10, progressText: `${Math.min(countFives, 10)} / 10` },
      ];
    }
  }

  return { leaderboard, currentProfileRating, achievements };
}
