import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'ユーザー名とパスワードが必要です' },
        { status: 400 }
      );
    }

    const success = await login(username, password);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'ユーザー名またはパスワードが間違っています' },
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
