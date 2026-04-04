// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./types/express/index.d.ts" />
import 'dotenv/config';
import 'reflect-metadata';
import fs from 'fs';
import http from 'http';
import path from 'path';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { Server } from 'socket.io';

import './utils/response/custom-success/customSuccess';
import { errorHandler } from './middleware/errorHandler';
import { getLanguage } from './middleware/getLanguage';
import routes from './routes';
import { configureSocket } from './socket';
import { setIo } from './socket/socketInstance';
import { dbCreateConnection } from './database/dbCreateConnection';
import './configs/redis';
import './configs/passport';

export const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://localhost'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Set global socket instance and configure handlers
setIo(io);
configureSocket(io);

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://localhost'],
    credentials: true,
  }),
);
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(getLanguage);
app.use(passport.initialize());

try {
  const accessLogStream = fs.createWriteStream(path.join(__dirname, '../log/access.log'), {
    flags: 'a',
  });
  app.use(morgan('combined', { stream: accessLogStream }));
} catch (err) {
  console.log(err);
}
app.use(morgan('combined'));

app.use('/', routes);

app.use(errorHandler);

(async () => {
  try {
    await dbCreateConnection();
    const port = process.env.PORT || 4000;
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Lỗi khi khởi tạo kết nối database hoặc server:', err);
  }
})();
