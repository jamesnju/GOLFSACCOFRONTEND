import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authApi } from '../api/auth';

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          console.log('Missing credentials');
          return null;
        }

        try {
          const response = await authApi.login({
            email,
            password,
          });

          let userData;
          let accessToken;
          let refreshToken;

          if (response && typeof response === 'object') {
            if ('data' in response && response.data) {
              const data = response.data as any;
              userData = data.user;
              accessToken = data.accessToken;
              refreshToken = data.refreshToken;
            }
          }

          if (!userData) {
            const responseAny = response as any;
            if (responseAny.user) {
              userData = responseAny.user;
              accessToken = responseAny.accessToken;
              refreshToken = responseAny.refreshToken;
            }
          }

          if (!userData) {
            console.error('No user data found in response:', response);
            return null;
          }

          if (!userData.isActive) {
            throw new Error('Account not activated. Please pay the registration fee.');
          }

          return {
            id: userData.id,
            email: userData.email ?? '',
            firstName: userData.firstName ?? '',
            lastName: userData.lastName ?? '',
            role: userData.role ?? 'PLAYER',
            isActive: userData.isActive ?? false,
            phone: userData.phone ?? '',
            joinDate: userData.joinDate ?? '',
            registrationFeePaid: userData.registrationFeePaid ?? false,
            accessToken: accessToken ?? '',
            refreshToken: refreshToken ?? '',
            wallet: userData.wallet,
          };
        } catch (error: any) {
          console.error('Auth error:', error.message);
          throw new Error(error.message || 'Invalid credentials');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.user = {
          id: user.id ?? '',
          email: user.email ?? '',
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          role: user.role ?? 'PLAYER',
          isActive: user.isActive ?? false,
          phone: user.phone ?? '',
          joinDate: user.joinDate ?? '',
          registrationFeePaid: user.registrationFeePaid ?? false,
          wallet: user.wallet,
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user = {
        id: token.user?.id ?? '',
        email: token.user?.email ?? '',
        firstName: token.user?.firstName ?? '',
        lastName: token.user?.lastName ?? '',
        role: token.user?.role ?? 'PLAYER',
        isActive: token.user?.isActive ?? false,
        phone: token.user?.phone ?? '',
        joinDate: token.user?.joinDate ?? '',
        registrationFeePaid: token.user?.registrationFeePaid ?? false,
        wallet: token.user?.wallet,
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// import { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { authApi } from '../api/auth';

// export const authConfig: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//   const email = credentials?.email as string | undefined;
//   const password = credentials?.password as string | undefined;

//   if (!email || !password) {
//     console.log('Missing credentials');
//     return null;
//   }

//   try {
//     const response = await authApi.login({
//       email,
//       password,
//     });

//     // Extract user data from response
//     let userData;
//     let accessToken;
//     let refreshToken;

//     if (response && typeof response === 'object') {
//       if ('data' in response && response.data) {
//         const data = response.data as any;
//         userData = data.user;
//         accessToken = data.accessToken;
//         refreshToken = data.refreshToken;
//       }
//     }

//     if (!userData) {
//       const responseAny = response as any;
//       if (responseAny.user) {
//         userData = responseAny.user;
//         accessToken = responseAny.accessToken;
//         refreshToken = responseAny.refreshToken;
//       }
//     }

//     if (!userData) {
//       console.error('No user data found in response:', response);
//       return null;
//     }

//     // Check if user is active
//     if (!userData.isActive) {
//       // Throw a specific error that will be caught
//       const error = new Error('Account not activated. Please pay the registration fee.');
//       error.name = 'PaymentRequiredError';
//       throw error;
//     }

//     // Return user object
//     return {
//       id: userData.id,
//       email: userData.email ?? '',
//       firstName: userData.firstName ?? '',
//       lastName: userData.lastName ?? '',
//       role: userData.role ?? 'PLAYER',
//       isActive: userData.isActive ?? false,
//       accessToken: accessToken ?? '',
//       refreshToken: refreshToken ?? '',
//       wallet: userData.wallet,
//     };
//   } catch (error: any) {
//     console.error('Auth error:', error.message);
//     // Rethrow with the specific message
//     throw new Error(error.message || 'Invalid credentials');
//   }
// }
//       // async authorize(credentials) {
//       //   const email = credentials?.email as string | undefined;
//       //   const password = credentials?.password as string | undefined;

//       //   if (!email || !password) {
//       //     console.log('Missing credentials');
//       //     return null;
//       //   }

//       //   try {
//       //     const response = await authApi.login({
//       //       email,
//       //       password,
//       //     });

//       //     // Extract user data from response
//       //     let userData;
//       //     let accessToken;
//       //     let refreshToken;

//       //     if (response && typeof response === 'object') {
//       //       if ('data' in response && response.data) {
//       //         const data = response.data as any;
//       //         userData = data.user;
//       //         accessToken = data.accessToken;
//       //         refreshToken = data.refreshToken;
//       //       }
//       //     }

//       //     if (!userData) {
//       //       const responseAny = response as any;
//       //       if (responseAny.user) {
//       //         userData = responseAny.user;
//       //         accessToken = responseAny.accessToken;
//       //         refreshToken = responseAny.refreshToken;
//       //       }
//       //     }

//       //     if (!userData) {
//       //       console.error('No user data found in response:', response);
//       //       return null;
//       //     }

//       //     // Check if user is active
//       //     if (!userData.isActive) {
//       //       throw new Error('Account not activated. Please pay the registration fee.');
//       //     }

//       //     // Return user object
//       //     return {
//       //       id: userData.id,
//       //       email: userData.email ?? '',
//       //       firstName: userData.firstName ?? '',
//       //       lastName: userData.lastName ?? '',
//       //       role: userData.role ?? 'PLAYER',
//       //       isActive: userData.isActive ?? false,
//       //       accessToken: accessToken ?? '',
//       //       refreshToken: refreshToken ?? '',
//       //       wallet: userData.wallet,
//       //     };
//       //   } catch (error: any) {
//       //     console.error('Login error:', error.message);
//       //     throw new Error(error.message || 'Invalid credentials');
//       //   }
//       // },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.accessToken = user.accessToken;
//         token.refreshToken = user.refreshToken;
//         token.user = {
//           id: user.id ?? '',
//           email: user.email ?? '',
//           firstName: user.firstName ?? '',
//           lastName: user.lastName ?? '',
//           role: user.role ?? 'PLAYER',
//           isActive: user.isActive ?? false,
//           wallet: user.wallet,
//         };
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken as string;
//       session.refreshToken = token.refreshToken as string;
//       session.user = {
//         id: token.user?.id ?? '',
//         email: token.user?.email ?? '',
//         firstName: token.user?.firstName ?? '',
//         lastName: token.user?.lastName ?? '',
//         role: token.user?.role ?? 'PLAYER',
//         isActive: token.user?.isActive ?? false,
//         wallet: token.user?.wallet,
//       };
//       return session;
//     },
//   },
//   pages: {
//     signIn: '/login',
//     signOut: '/',
//     error: '/login',
//   },
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60,
//   },
//   cookies: {
//   sessionToken: {
//     name: `next-auth.session-token`,
//     options: {
//       httpOnly: true,
//       sameSite: 'lax',
//       path: '/',
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 30 * 24 * 60 * 60,
//       // Remove domain - this can cause issues on localhost
//     },
//   },
// },
//   secret: process.env.NEXTAUTH_SECRET,
// };