import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import validator from 'validator';

import { DoctorSchedule } from 'typeorm/entities/doctorSchedule';
import { CustomError } from 'utils/response/custom-error/CustomError';
import { ErrorValidation } from 'utils/response/custom-error/types';

export const validatorCreateDoctorSchedule = async (req: Request, res: Response, next: NextFunction) => {
  let { date } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  // validator.isEmpty chỉ nhận string
  date = !date ? '' : String(date);

  // 1. CHỈ Validate Hình Thức (Format, Empty) ở Middleware
  if (validator.isEmpty(date)) {
    errorsValidation.push({ date: 'Ngày không được để trống' });
  }

  if (errorsValidation.length !== 0) {
    const customError = new CustomError(400, 'Validation', 'Tạo lịch hẹn thất bại', null, null, errorsValidation);
    return next(customError);
  }

  next();
};
