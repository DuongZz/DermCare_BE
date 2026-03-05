import 'dotenv/config';
import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import http from 'http';

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
import routes from './routes';
import { configureSocket } from './socket';
import { dbCreateConnection } from './typeorm/dbCreateConnection';
import './configs/redis';
import './configs/passport';

export const app = express();
const httpServer = http.createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://localhost'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
// Khởi tạo các handler của socket
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

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

(async () => {
  await dbCreateConnection();
})();

// Force restart
