import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'パスワードが必要です' },
        { status: 400 }
      );
    }

    const success = await login(password);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'パスワードが間違っています' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'ログインに失敗しました' },
      { status: 500 }
    );
  }
}
