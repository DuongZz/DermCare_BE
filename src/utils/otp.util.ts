import bcrypt from 'bcryptjs'

/**
 * Generate OTP range from 100000 to 999999
 * @returns string OTP range from 100000 to 999999
 */
export const genOTP = () => {
  const otp = Math.floor(Math.random() * 900000) + 100000
  return otp.toString()
}

/**
 * Hash OTP
 * @param otp string
 * @returns Promise<string>
 */
export const hashOTP = async (otp: string) => {
  const salt = await bcrypt.genSalt(10)
  const hashedOTP = await bcrypt.hash(otp, salt)
  return hashedOTP
}

/**
 * Compare OTP
 * @param otp string
 * @param hash string
 * @returns Promise<boolean>
 */
export const compareOTP = async (otp: string, hash: string) => {
  return bcrypt.compare(otp, hash)
}
