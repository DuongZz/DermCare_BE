import jwt from 'jsonwebtoken';

import { JwtPayload } from '../types/JwtPayload';

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION as any,
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION as any,
  });
};
