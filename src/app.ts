import CONSTANT from '@/configs/constant.config'
import ENV from '@/configs/env.config'
import express, { Express } from 'express'
import http from 'http'
import cors from 'cors'
import corsOptions from '@/configs/cors.config'
import { bootstrapFolder } from '@/utils/file.util'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import routes from '@/routes'
import sanitizeRequest from './middlewares/sanitize.middleware'
import notFoundHandler from './middlewares/not-found.middleware'
import { errorResponse } from './utils/response.util'
import MIDDLEWARE_MESSAGE from '@/messages/middleware.message'
import errorMiddleware from './middlewares/error.middleware'
import morgan from 'morgan';
import { morganApiStream, morganErrorStream } from '@/configs/logger.config'
import { setupGlobalErrorHandlers } from './utils/global-error-handler.ultil'
import { initSocket } from './socket'

const app: Express = express()
const server = http.createServer(app)

bootstrapFolder([
  CONSTANT.FOLDER.LOGS_DIR,
  CONSTANT.FOLDER.API_LOGS_DIR,
  CONSTANT.FOLDER.ERROR_LOGS_DIR,
  CONSTANT.FOLDER.BACKUP_DIR,
])

//Log HTTP API request vào ApiLog
app.use(morgan('combined', {
  stream: morganApiStream,
  skip: (req, res) => res.statusCode >= 400
}));

// Log HTTP lỗi (>= 400) vào ErrorLog
app.use(morgan('combined', {
  stream: morganErrorStream,
  skip: (req, res) => res.statusCode < 400
}));
//CORS
app.use(cors(corsOptions()))

//On Dev
if (ENV.NODE_ENV === CONSTANT.NODE.DEV) {
  app.use(express.urlencoded({ extended: true }))
  //TODO: implement Swagger
}

app.use(cookieParser())
app.use(express.json())

//Helmet, use helmet to secure the app headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'no-referrer' },
  })
)

//Rate Limit, use rate limit to prevent brute force attack
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: ENV.NODE_ENV === CONSTANT.NODE.DEV ? 100000 : 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(
        errorResponse(
          options.statusCode,
          MIDDLEWARE_MESSAGE.RATE_LIMIT.TOO_MANY_REQUESTS
        )
      )
    },
  })
)

//Sanitize request: Xử lý sanitize request trước khi đi vào controller tranh các cuộc tấn công XSS
app.use(sanitizeRequest)

//Routes
app.use('/api', routes)

//Not Found Handler
app.use(notFoundHandler)

app.use(errorMiddleware)

setupGlobalErrorHandlers()

initSocket(server)

export default server
