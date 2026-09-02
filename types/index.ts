import { Prisma } from '@prisma/client';

// Типы для enum-подобных значений
export type Role = 'DIRECTOR' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'PARENT';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type DiscountRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'USED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'REFUNDED';
export type HomeworkStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'CHECKED' | 'OVERDUE';
export type GroupStatus = 'ACTIVE' | 'RECRUITING' | 'COMPLETED' | 'ARCHIVED';

// Реэкспорт основных типов из Prisma
export type {
  User,
  Teacher,
  Parent,
  Student,
  Group,
  Lesson,
  AttendanceRecord,
  StarTransaction,
  DiscountRequest,
  PushSubscription,
  Payment,
  Homework,
  HomeworkSubmission,
  Grade,
  Reward,
  Notification,
  CenterSettings,
} from '@prisma/client';

// Составные типы для API-ответов
export type TeacherWithUser = Prisma.TeacherGetPayload<{
  include: {
    user: true;
  };
}>;

export type TeacherWithGroups = Prisma.TeacherGetPayload<{
  include: {
    user: true;
    groups: {
      include: {
        lessons: true;
      };
    };
  };
}>;

export type ParentWithStudents = Prisma.ParentGetPayload<{
  include: {
    user: true;
    students: {
      include: {
        group: {
          include: {
            teacher: {
              include: {
                user: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    parent: {
      include: {
        user: true;
      };
    };
    group: {
      include: {
        teacher: {
          include: {
            user: true;
          };
        };
        lessons: true;
      };
    };
  };
}>;

export type GroupWithStudents = Prisma.GroupGetPayload<{
  include: {
    teacher: {
      include: {
        user: true;
      };
    };
    students: {
      include: {
        starTransactions: true;
      };
    };
    lessons: true;
  };
}>;

export interface StudentLevel {
  level: number;
  levelName: string;
  totalStars: number;
  currentBalance: number;
  nextLevelStars: number | null;
  progressPercent: number;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  starsCost: number;
  available: boolean;
}

