import { IMinioBucketConfig } from '@/interfaces/minio.interface'
import path from 'path'
/*
* Định nghĩa các hằng số chung cho toàn bộ ứng dụng
*/
export default {
  // Định nghĩa các môi trường
  NODE: {
    DEV: 'dev',
    PROD: 'prod',
  },
  // Định nghĩa các bucket cho minio
  MINIO: {
    BUCKETS: [
      { name: 'public-image', private: false },
      { name: 'private-image', private: true },
      // Add more buckets here if needed (ex: video, audio, ...)
    ] as IMinioBucketConfig[],
  },
  // Định nghĩa các folder cho ứng dụng
  FOLDER: {
    TEMPLATE_DIR: path.resolve('src/templates'),
    LOGS_DIR: path.resolve('logs'),
    API_LOGS_DIR: path.resolve('logs/apis'),
    ERROR_LOGS_DIR: path.resolve('logs/errors'),
    BACKUP_DIR: path.resolve('backups'),
  },
  //PAGINATION
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
  },
  MULTER: {
    AVATAR: "avatar",
  },
  COOKIES: {
    REFRESH_TOKEN_NAME: 'refresh_token',
  },
  CACHE: {
    LOGIN_ATTEMPT_PREFIX: 'login_attempt_',
    BLOCK_LOGIN_PREFIX: 'block_login_',
  },
  DEFAUL_ROLE: {
    USER: 'USER',
    ADMIN: 'ADMIN',
  },
  //CACHE KEY
  CACHE_KEY: {
    PERMISSION: {
      ALL: 'permission:all',
      PAGINATE: 'permission:paginate',
      BY_ID: 'permission:id',
    },
    ROLE: {
      ALL: 'role:all',
      PAGINATE: 'role:paginate',
      BY_ID: 'role:id',
    }
  }
} as const
