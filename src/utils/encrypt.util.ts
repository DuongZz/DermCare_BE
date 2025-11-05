import bcrypt from 'bcryptjs'
import { createHmac } from 'crypto'
import ENV from '@/configs/env.config'
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

export function hashToken(token: string): string {
  const hmac = createHmac('sha256', ENV.JWT.TOKEN_HASH_SECRET as string) // Tạo đối tượng HMAC với SHA256 và khóa bí mật
  hmac.update(token) // Cập nhật dữ liệu cần hash (refresh token)
  return hmac.digest('hex') // Trả về kết quả HMAC dưới dạng chuỗi hex
}
