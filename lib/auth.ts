import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData } from './types';
import postgres from 'postgres';

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

// データベース認証
async function verifyUserCredentials(username: string, password: string): Promise<boolean> {
  try {
    if (!process.env.POSTGRES_URL) {
      console.error('POSTGRES_URL is not set');
      return false;
    }

    let connectionString = process.env.POSTGRES_URL;
    if (connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
      connectionString = connectionString.replace('postgres://', 'postgresql://');
    }

    const sql = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // ユーザーを検索してパスワードを検証
    const result = await sql`
      SELECT
        id,
        username,
        password_hash = crypt(${password}, password_hash) AS password_match
      FROM users
      WHERE username = ${username}
    `;

    await sql.end();

    if (result.length === 0) {
      return false;
    }

    return result[0].password_match === true;
  } catch (error) {
    console.error('Database authentication error:', error);
    return false;
  }
}

// ログイン処理（ユーザー名とパスワード）
export async function login(username: string, password: string): Promise<boolean> {
  const isValid = await verifyUserCredentials(username, password);

  if (!isValid) {
    return false;
  }

  const session = await getSession();
  session.isLoggedIn = true;
  session.username = username;
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
