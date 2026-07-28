import { useSession, signIn, signOut as nextSignOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status, update } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;
  const accessToken = session?.accessToken;
  const isAdmin = user?.role === 'ADMIN';
  const isPlayer = user?.role === 'PLAYER';
  const isPro = user?.role === 'PRO';
  const isCaddy = user?.role === 'CADDY';

  const signOut = async () => {
    await nextSignOut({ callbackUrl: '/' });
  };

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    return result;
  };

  return {
    session,
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isAdmin,
    isPlayer,
    isPro,
    isCaddy,
    signOut,
    login,
    update,
  };
}