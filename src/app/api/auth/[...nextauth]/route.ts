// app/api/auth/[...nextauth]/route.ts
import { authConfig } from '@/lib/auth/auth.config';
import NextAuth from 'next-auth';

const handler = NextAuth({
  ...authConfig,
  // Add these debug options
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata);
    },
  },
});

export { handler as GET, handler as POST };