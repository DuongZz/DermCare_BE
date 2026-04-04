/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace Express {
  interface Request {
    jwtPayload: import('./JwtPayload').JwtPayload;
    language: string;
    fileUrl?: string;
  }
  interface Response {
    customSuccess(httpStatusCode: number, message: string | number, data?: any): this;
  }
}
