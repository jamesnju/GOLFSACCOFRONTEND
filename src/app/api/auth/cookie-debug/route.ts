import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const sessionCookie = cookieStore.get('next-auth.session-token');
  
  return NextResponse.json({
    allCookies: allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 20) + '...' })),
    sessionCookie: sessionCookie ? {
      name: sessionCookie.name,
      value: sessionCookie.value?.substring(0, 20) + '...',
    } : null,
    timestamp: new Date().toISOString(),
  });
}