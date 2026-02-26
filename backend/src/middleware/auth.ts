import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

export async function verifyAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    (req as any).userId = decodedToken.uid;
    next();
  } catch (error: any) {
    console.error('Auth verification failed:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
