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
  entities: ['src/typeorm/entities/**/*.ts', 'typeorm/entities/**/*.js'],
  migrations: ['src/typeorm/migrations/**/*.ts', 'typeorm/migrations/**/*.js'],
  subscribers: ['src/typeorm/subscriber/**/*.ts', 'typeorm/subscriber/**/*.js'],
  cli: {
    entitiesDir: 'src/typeorm/entities',
    migrationsDir: 'src/typeorm/migrations',
    subscribersDir: 'src/typeorm/subscriber',
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export = config;
