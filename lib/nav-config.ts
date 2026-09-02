import {
  Home, Users, GraduationCap, Calendar, CheckSquare,
  DollarSign, FileText, BookOpen, Award, BarChart3,
  Bell, Settings, Star, ShoppingBag, TrendingUp, CreditCard, Building
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: any;
}

export const ROLE_NAV_ITEMS: Record<string, NavItem[]> = {
  DIRECTOR: [
    { name: 'Главная', href: '/director', icon: Home },
    { name: 'Ученики', href: '/director/students', icon: Users },
    { name: 'Учителя', href: '/director/teachers', icon: GraduationCap },
    { name: 'Группы', href: '/director/groups', icon: Building },
    { name: 'Расписание', href: '/director/schedule', icon: Calendar },
    { name: 'Посещаемость', href: '/director/attendance', icon: CheckSquare },
    { name: 'Финансы', href: '/director/finances', icon: DollarSign },
    { name: 'Заявки', href: '/director/applications', icon: FileText },
    { name: 'Домашки', href: '/director/homework', icon: BookOpen },
    { name: 'Награды', href: '/director/rewards', icon: Award },
    { name: 'Аналитика', href: '/director/analytics', icon: BarChart3 },
    { name: 'Уведомления', href: '/director/notifications', icon: Bell },
    { name: 'Настройки', href: '/director/settings', icon: Settings },
  ],
  MANAGER: [
    { name: 'Главная', href: '/manager', icon: Home },
    { name: 'Ученики', href: '/manager/students', icon: Users },
    { name: 'Группы', href: '/manager/groups', icon: Building },
    { name: 'Расписание', href: '/manager/schedule', icon: Calendar },
    { name: 'Заявки', href: '/manager/applications', icon: FileText },
    { name: 'Платежи', href: '/manager/payments', icon: CreditCard },
    { name: 'Уведомления', href: '/manager/notifications', icon: Bell },
  ],
  TEACHER: [
    { name: 'Главная', href: '/teacher', icon: Home },
    { name: 'Мои группы', href: '/teacher/groups', icon: Building },
    { name: 'Мои ученики', href: '/teacher/students', icon: Users },
    { name: 'Расписание', href: '/teacher/schedule', icon: Calendar },
    { name: 'Посещаемость', href: '/teacher/attendance', icon: CheckSquare },
    { name: 'Домашки', href: '/teacher/homework', icon: BookOpen },
    { name: 'Оценки', href: '/teacher/grades', icon: Star },
    { name: 'Награды ⭐', href: '/teacher/rewards', icon: Award },
    { name: 'Уведомления', href: '/teacher/notifications', icon: Bell },
  ],
  STUDENT: [
    { name: 'Главная', href: '/student', icon: Home },
    { name: 'Расписание', href: '/student/schedule', icon: Calendar },
    { name: 'Домашки', href: '/student/homework', icon: BookOpen },
    { name: 'Оценки', href: '/student/grades', icon: Star },
    { name: 'Прогресс', href: '/student/progress', icon: TrendingUp },
    { name: 'Посещаемость', href: '/student/attendance', icon: CheckSquare },
    { name: 'Мои Звёзды', href: '/student/stars', icon: Award },
    { name: 'Магазин наград', href: '/student/store', icon: ShoppingBag },
    { name: 'Уведомления', href: '/student/notifications', icon: Bell },
  ],
  PARENT: [
    { name: 'Главная', href: '/parent', icon: Home },
    { name: 'Дети', href: '/parent/children', icon: Users },
    { name: 'Расписание', href: '/parent/schedule', icon: Calendar },
    { name: 'Посещаемость', href: '/parent/attendance', icon: CheckSquare },
    { name: 'Оценки', href: '/parent/grades', icon: Star },
    { name: 'Домашки', href: '/parent/homework', icon: BookOpen },
    { name: 'Платежи', href: '/parent/payments', icon: CreditCard },
    { name: 'Уведомления', href: '/parent/notifications', icon: Bell },
  ],
};

export const ROLE_LABELS: Record<string, string> = {
  DIRECTOR: 'Директор',
  MANAGER: 'Менеджер',
  TEACHER: 'Учитель',
  STUDENT: 'Ученик',
  PARENT: 'Родитель',
};
