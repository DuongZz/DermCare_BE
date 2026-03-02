import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'typeorm/entities/user';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { password, passwordNew } = req.body;
  const { id, name } = req.jwtPayload;

  const userRepository = getRepository(User);
  try {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      const customError = new CustomError(404, 'General', 'Không tìm thấy', [`Không tìm thấy tài khoản ${name}.`]);
      return next(customError);
    }

    if (!user.checkIfPasswordMatch(password)) {
      const customError = new CustomError(400, 'General', 'Không tìm thấy', ['Mật khẩu không chính xác']);
      return next(customError);
    }

    user.password = passwordNew;
    user.hashPassword();
    userRepository.save(user);

    res.customSuccess(200, 'Đổi mật khẩu thành công.');
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi xảy ra', null, err);
    return next(customError);
  }
};
