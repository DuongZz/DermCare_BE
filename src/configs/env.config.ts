import dotenv from 'dotenv'

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

export default {
  // Basic info about the server
  NODE_ENV: process.env.NODE_ENV || 'dev',
  PORT: process.env.PORT || 8888,
  NAME: process.env.NAME || 'Express TS App',
  CORS_ORIGIN: (process.env.CORS_ORIGIN || '*').split(','),
  // Database config
  DB: {
    MONGO_URI: process.env.MONGO_URI,
    MONGO_USERNAME: process.env.MONGO_USERNAME,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    MONGO_DATABASE: process.env.MONGO_DATABASE,
  },
  // Minio config
  MINIO: {
    ENDPOINT: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    ACCESS_KEY: process.env.MINIO_ACCESS_KEY || 'minio_ac',
    SECRET_KEY: process.env.MINIO_SECRET_KEY || 'minio_se',
    HOST: process.env.MINIO_HOST || 'http://localhost',
    PORT: Number(process.env.MINIO_PORT) || 9000,
  },
  // Redis config
  REDIS: {
    PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  },
  //NodeMailer config
  NODEMAILER: {
    SENDER: process.env.NODEMAILER_SENDER as string,
    APP_PASSWORD: process.env.NODEMAILER_APP_PASSWORD,
    HOST: process.env.NODEMAILER_HOST,
    ADMIN_EMAIL: process.env.NODEMAILER_ADMIN_EMAIL,
    LOG_SENDER: process.env.NODEMAILER_LOG_SENDER,
  },
  // JWT config
  JWT: {
    // Secret
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    PRE_ACCESS_TOKEN_SECRET: process.env.PRE_ACCESS_TOKEN_SECRET,
    // Expire time
    ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE,
    REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE,
    PRE_ACCESS_TOKEN_EXPIRE: process.env.PRE_ACCESS_TOKEN_EXPIRE,
    // Hash secret
    TOKEN_HASH_SECRET: process.env.TOKEN_HASH_SECRET,
  },
  // Google config
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  },
  // Backup config
  BACKUP: {
    GIT_REPO_DIR: process.env.GIT_REPO_DIR,
    GIT_USERNAME: process.env.GIT_USERNAME,
    GIT_PAT: process.env.GIT_PAT,
    GIT_EMAIL: process.env.GIT_EMAIL,
  },
  // Firebase config
  FIREBASE: {
    TYPE: process.env.TYPE,
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
    FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI,
    FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI,
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL:
      process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    FIREBASE_CLIENT_X509_CERT_URL: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    FIREBASE_UNIVERSE_DOMAIN: process.env.FIREBASE_UNIVERSE_DOMAIN,
  },
} as const
