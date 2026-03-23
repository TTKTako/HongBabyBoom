import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'fallback_dev_secret_change_me'
);

export interface JWTPayload {
  userId: number;
  displayName: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, displayName: payload.displayName })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as number,
      displayName: payload.displayName as string,
    };
  } catch {
    return null;
  }
}
