import {
  Home, Users, GraduationCap, Calendar, CheckSquare,
  DollarSign, FileText, BookOpen, Award, BarChart3,
  Bell, Settings, Star, ShoppingBag, TrendingUp, CreditCard, Building, Trophy
} from 'lucide-react';

export interface NavItem {
  name: string;
  key: string;
  href: string;
  icon: any;
}

export const ROLE_NAV_ITEMS: Record<string, NavItem[]> = {
  DIRECTOR: [
    { name: 'Главная', key: 'home', href: '/director', icon: Home },
    { name: 'Ученики', key: 'students', href: '/director/students', icon: Users },
    { name: 'Учителя', key: 'teachers', href: '/director/teachers', icon: GraduationCap },
    { name: 'Группы', key: 'groups', href: '/director/groups', icon: Building },
    { name: 'Расписание', key: 'schedule', href: '/director/schedule', icon: Calendar },
    { name: 'Посещаемость', key: 'attendance', href: '/director/attendance', icon: CheckSquare },
    { name: 'Финансы', key: 'finances', href: '/director/finances', icon: DollarSign },
    { name: 'Заявки', key: 'applications', href: '/director/applications', icon: FileText },
    { name: 'Домашки', key: 'homework', href: '/director/homework', icon: BookOpen },
    { name: 'Награды', key: 'rewards', href: '/director/rewards', icon: Award },
    { name: 'Аналитика', key: 'analytics', href: '/director/analytics', icon: BarChart3 },
    { name: 'Уведомления', key: 'notifications', href: '/director/notifications', icon: Bell },
    { name: 'Настройки', key: 'settings', href: '/director/settings', icon: Settings },
  ],
  MANAGER: [
    { name: 'Главная', key: 'home', href: '/manager', icon: Home },
    { name: 'Ученики', key: 'students', href: '/manager/students', icon: Users },
    { name: 'Группы', key: 'groups', href: '/manager/groups', icon: Building },
    { name: 'Расписание', key: 'schedule', href: '/manager/schedule', icon: Calendar },
    { name: 'Заявки', key: 'applications', href: '/manager/applications', icon: FileText },
    { name: 'Платежи', key: 'payments', href: '/manager/payments', icon: CreditCard },
    { name: 'Уведомления', key: 'notifications', href: '/manager/notifications', icon: Bell },
  ],
  TEACHER: [
    { name: 'Главная', key: 'home', href: '/teacher', icon: Home },
    { name: 'Мои группы', key: 'myGroups', href: '/teacher/groups', icon: Building },
    { name: 'Мои ученики', key: 'myStudents', href: '/teacher/students', icon: Users },
    { name: 'Расписание', key: 'schedule', href: '/teacher/schedule', icon: Calendar },
    { name: 'Посещаемость', key: 'attendance', href: '/teacher/attendance', icon: CheckSquare },
    { name: 'Домашки', key: 'homework', href: '/teacher/homework', icon: BookOpen },
    { name: 'Оценки', key: 'grades', href: '/teacher/grades', icon: Star },
    { name: 'Награды ⭐', key: 'rewards', href: '/teacher/rewards', icon: Award },
    { name: 'Уведомления', key: 'notifications', href: '/teacher/notifications', icon: Bell },
  ],
  STUDENT: [
    { name: 'Главная', key: 'home', href: '/student', icon: Home },
    { name: 'Рейтинг', key: 'rating', href: '/student/rating', icon: Trophy },
    { name: 'Расписание', key: 'schedule', href: '/student/schedule', icon: Calendar },
    { name: 'Домашки', key: 'homework', href: '/student/homework', icon: BookOpen },
    { name: 'Оценки', key: 'grades', href: '/student/grades', icon: Star },
    { name: 'Прогресс', key: 'progress', href: '/student/progress', icon: TrendingUp },
    { name: 'Посещаемость', key: 'attendance', href: '/student/attendance', icon: CheckSquare },
    { name: 'Мои Звёзды', key: 'myStars', href: '/student/stars', icon: Award },
    { name: 'Магазин наград', key: 'rewardStore', href: '/student/store', icon: ShoppingBag },
    { name: 'Уведомления', key: 'notifications', href: '/student/notifications', icon: Bell },
  ],
  PARENT: [
    { name: 'Главная', key: 'home', href: '/parent', icon: Home },
    { name: 'Дети', key: 'children', href: '/parent/children', icon: Users },
    { name: 'Расписание', key: 'schedule', href: '/parent/schedule', icon: Calendar },
    { name: 'Посещаемость', key: 'attendance', href: '/parent/attendance', icon: CheckSquare },
    { name: 'Оценки', key: 'grades', href: '/parent/grades', icon: Star },
    { name: 'Домашки', key: 'homework', href: '/parent/homework', icon: BookOpen },
    { name: 'Платежи', key: 'payments', href: '/parent/payments', icon: CreditCard },
    { name: 'Уведомления', key: 'notifications', href: '/parent/notifications', icon: Bell },
  ],
};

export const ROLE_LABELS: Record<string, string> = {
  DIRECTOR: 'Директор',
  MANAGER: 'Менеджер',
  TEACHER: 'Учитель',
  STUDENT: 'Ученик',
  PARENT: 'Родитель',
};
