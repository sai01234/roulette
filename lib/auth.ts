import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData } from './types';

// セッション設定
export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'moderator_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7日間
  },
};

// セッション取得
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// ログイン処理
export async function login(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password !== adminPassword) {
    return false;
  }

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  return true;
}

// ログアウト処理
export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

// 認証チェック
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}
