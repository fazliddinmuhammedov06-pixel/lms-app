import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),

  session: { strategy: 'jwt' },

  pages: {
    signIn: '/',
  },

  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth authorize] 1. Попытка авторизации');

        const rawPhone = (credentials?.phone as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;

        console.log('[Auth authorize] 2. Входной телефон:', rawPhone, '| Пароль передается:', !!password);

        if (!rawPhone || !password) {
          console.log('[Auth authorize] ❌ Ошибка: Не указан телефон или пароль');
          return null;
        }

        // Нормализация телефона (+998XXXXXXXXX)
        const digits = rawPhone.replace(/\D/g, '');
        let phone = rawPhone;
        if (digits.startsWith('998')) {
          phone = '+' + digits;
        } else if (digits.length === 9) {
          phone = '+998' + digits;
        }

        console.log('[Auth authorize] 3. Нормализованный номер телефона:', phone);

        const user = await prisma.user.findUnique({ where: { phone } });

        console.log(
          '[Auth authorize] 4. Результат поиска в БД:',
          user
            ? { id: user.id, phone: user.phone, role: user.role, hasPasswordHash: !!user.passwordHash }
            : 'ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН'
        );

        if (!user) {
          console.log('[Auth authorize] ❌ Ошибка: Пользователь с таким телефоном не найден в БД');
          return null;
        }

        if (user.passwordHash) {
          console.log('[Auth authorize] 5. Проверка bcrypt пароля...');
          const isValid = await bcrypt.compare(password, user.passwordHash);
          console.log('[Auth authorize] 5. Результат проверки пароля (bcrypt.compare):', isValid);
          if (!isValid) {
            console.log('[Auth authorize] ❌ Ошибка: Неверный пароль');
            return null;
          }
        } else {
          console.log('[Auth authorize] 5. passwordHash отсутствует, проверка с дефолтным 123456...');
          if (password !== '123456') {
            console.log('[Auth authorize] ❌ Ошибка: Неверный дефолтный пароль');
            return null;
          }
        }

        console.log('[Auth authorize] ✅ Авторизация успешна для пользователя:', {
          id: user.id,
          name: user.name,
          role: user.role,
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { phone?: string }).phone = token.phone as string;
      }
      return session;
    },
  },
});


