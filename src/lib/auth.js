import jwt from 'jsonwebtoken';

export const AUTH_COOKIE = 'skandaplus_session';

const SECRET = process.env.JWT_SECRET;

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
