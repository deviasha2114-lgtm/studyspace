import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors.lib';

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('NEXTAUTH_SECRET or JWT_SECRET env var is required');

export interface JWTPayload { id: string; email: string; name?: string; sub?: string; }

declare global { namespace Express { interface Request { user: JWTPayload; } } }

export function authenticateJWT(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) return next(new AppError(401, 'Missing or malformed Authorization header'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JWTPayload;
    req.user = { ...decoded, id: decoded.id ?? decoded.sub ?? '' };
    return next();
  } catch (err) {
    return next(new AppError(401, err instanceof jwt.TokenExpiredError ? 'Token expired' : 'Invalid token'));
  }
}
