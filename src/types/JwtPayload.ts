import { Role } from '../typeorm/entities/enum';

export type JwtPayload = {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: Date;
  rememberMe?: boolean;
};
