import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: false,
  ssl: true,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  entities: [
    process.env.NODE_ENV === 'production' ? 'dist/database/entities/**/*.js' : 'src/database/entities/**/*.ts',
  ],
  migrations: [
    process.env.NODE_ENV === 'production' ? 'dist/database/migrations/**/*.js' : 'src/database/migrations/**/*.ts',
  ],
  subscribers: [
    process.env.NODE_ENV === 'production' ? 'dist/database/subscriber/**/*.js' : 'src/database/subscriber/**/*.ts',
  ],
  cli: {
    entitiesDir: 'src/database/entities',
    migrationsDir: 'src/database/migrations',
    subscribersDir: 'src/database/subscriber',
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export = config;
