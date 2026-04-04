import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { User } from '@database/entities/user';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const updateMyProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtPayload.id;
    const { fullName, phone, gender, dateOfBirth, address } = req.body;

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new CustomError(404, 'General', 'Không tìm thấy người dùng');
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;

    await userRepo.save(user);

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
    });
  } catch (error) {
    next(error);
  }
};
