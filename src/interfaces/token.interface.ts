import { JwtPayload } from "jsonwebtoken";
import { ETokenType } from '@/configs/enum.config'

export interface ITokenPayload extends JwtPayload {
  _id: string
  email: string
  type: string
}

export interface IPreATPayload extends ITokenPayload {
  type: ETokenType.PRE_ACCESS_VE | ETokenType.PRE_ACCESS_RP | ETokenType.PRE_ACCESS_V2FA
}

export interface IATPayload extends ITokenPayload {
  type: ETokenType.ACCESS
  roles: string[]
  status: string
}

export interface IRTPayload extends ITokenPayload {
  type: ETokenType.REFRESH
  status: string
  timestamp: number // Thời gian tạo token -> hash thành chuỗi unique
}

