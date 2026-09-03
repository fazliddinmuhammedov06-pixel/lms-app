import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
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
        const phone = (credentials?.phone as string | undefined)?.trim();
        const password = credentials?.password as string | undefined;

        if (!phone || !password) return null;

        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) return null;

        // Проверяем пароль через bcrypt, если passwordHash установлен
        if (user.passwordHash) {
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;
        } else {
          // Если у существующего пользователя еще нет passwordHash, сверяем со стандартным "123456"
          if (password !== '123456') return null;
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

