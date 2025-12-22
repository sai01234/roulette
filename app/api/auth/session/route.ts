import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    return NextResponse.json({ isLoggedIn: authenticated });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ isLoggedIn: false }, { status: 500 });
  }
}
