import { JwtPayload } from '../JwtPayload';

declare global {
  namespace Express {
    export interface Request {
      jwtPayload: JwtPayload;
    }
    export interface Response {
      customSuccess(httpStatusCode: number, message: string, data?: any): this;
    }
  }
}

// Ensure the module is also augmented if necessary for certain TS configurations
declare module 'express-serve-static-core' {
  interface Request {
    jwtPayload: JwtPayload;
  }
  interface Response {
    customSuccess(httpStatusCode: number, message: string, data?: any): this;
  }
}
