import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

// Extend the built-in Session type
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      wallet?: {
        balance: number;
        lockedBalance: number;
      };
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    accessToken: string;
    refreshToken: string;
    wallet?: {
      balance: number;
      lockedBalance: number;
    };
  }
}

// Extend the built-in JWT type
declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
      wallet?: {
        balance: number;
        lockedBalance: number;
      };
    };
  }
}