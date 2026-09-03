import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // JWT стратегия — не храним сессии в БД, быстрее и проще для старта
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/',
  },

  providers: [
    Credentials({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        const phone = (credentials?.phone as string | undefined)?.trim();
        const otp = (credentials?.otp as string | undefined)?.trim();

        if (!phone || !otp) return null;

        // Универсальный мастер-код "123456" для тестирования
        const isMasterDevCode = otp === '123456';

        if (!isMasterDevCode) {
          // Проверяем OTP в БД
          const record = await prisma.otpCode.findFirst({
            where: {
              phone,
              code: otp,
              used: false,
            },
            orderBy: { createdAt: 'desc' },
          });

          if (!record) {
            console.error(`[Auth Error] OTP record not found or already used for phone: ${phone}`);
            return null;
          }

          // Проверяем срок действия
          const expiresTime = new Date(record.expiresAt).getTime();
          if (expiresTime < Date.now()) {
            console.error(`[Auth Error] OTP expired for phone: ${phone}. Expired at: ${record.expiresAt}`);
            return null;
          }

          // Помечаем OTP как использованный
          await prisma.otpCode.update({
            where: { id: record.id },
            data: { used: true },
          });
        }

        // Ищем пользователя
        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          console.error(`[Auth Error] User not found for phone: ${phone}`);
          return null;
        }

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
    // Добавляем role и phone в JWT токен
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },

    // Передаём role и phone в session.user
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
