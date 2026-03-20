import { response, Response } from 'express';

(response as any).customSuccess = function (httpStatusCode: number, message: string, data: any = null): Response {
  return this.status(httpStatusCode).json({ success: true, message, data });
};

export class CustomSuccess extends Error {
  httpStatusCode: number;
  data: any;

  constructor(httpStatusCode: number, message: string, data: any = null) {
    super(message);
    this.httpStatusCode = httpStatusCode;
    this.data = data;
  }
}
