import { Role } from '@database/entities/enum';
import { User } from '@database/entities/user';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { JwtPayload } from 'types/JwtPayload';
import { generateAccessToken, generateRefreshToken } from 'utils/createJwtToken';
import { CustomError } from 'utils/response/custom-error/CustomError';

export class AuthCoreService {
  /**
   * Xử lý logic đăng nhập
   */
  async login(email: string, password: string, rememberMe: boolean) {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new CustomError(404, 'General', 'Không tìm thấy', ['Email hoặc mật khẩu không đúng']);
    }

    if (!user.checkIfPasswordMatch(password)) {
      throw new CustomError(404, 'General', 'Không tìm thấy', ['Email hoặc mật khẩu không đúng']);
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role as Role,
      created_at: user.created_at,
      rememberMe: !!rememberMe,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    user.refreshToken = refreshToken;
    await userRepository.save(user);

    return { accessToken, refreshToken, user, jwtPayload };
  }

  /**
   * Xử lý tạo token sau khi mạng xã hội (Google/FB) trả về User
   */
  async socialLogin(user: User) {
    const userRepository = getRepository(User);

    const jwtPayload: JwtPayload = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role as Role,
      created_at: user.created_at,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    user.refreshToken = refreshToken;
    await userRepository.save(user);

    return { accessToken, refreshToken };
  }

  /**
   * Xử lý logic làm mới token (wash)
   */
  async washToken(refreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch (err) {
      throw new CustomError(401, 'General', 'Phiên đăng nhập không hợp lệ');
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne(payload.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new CustomError(401, 'General', 'Phiên đăng nhập không khớp hoặc đã hết hạn');
    }

    const jwtPayload: JwtPayload = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role as Role,
      created_at: user.created_at,
      rememberMe: payload.rememberMe,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken(jwtPayload);

    user.refreshToken = newRefreshToken;
    await userRepository.save(user);

    return { accessToken, newRefreshToken, user, jwtPayload };
  }

  /**
   * Xử lý logic đăng ký người dùng mới
   */
  async register(userData: any) {
    const { email, password, fullName, gender, dateOfBirth, phone, address } = userData;
    const userRepository = getRepository(User);

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new CustomError(400, 'General', 'Tài khoản đã tồn tại', ['Email đã được đăng ký']);
    }

    const newUser = new User();
    newUser.email = email;
    newUser.password = password;
    newUser.fullName = fullName;
    newUser.phone = phone;
    newUser.gender = gender;
    newUser.dateOfBirth = dateOfBirth;
    newUser.address = address;

    newUser.hashPassword();
    return await userRepository.save(newUser);
  }

  /**
   * Xử lý logic đăng xuất
   */
  async logout(userId: string) {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne(userId);
    if (user) {
      user.refreshToken = null as any;
      await userRepository.save(user);
    }
  }
}

export const authCoreService = new AuthCoreService();
