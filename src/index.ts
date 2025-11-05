/* eslint-disable no-console */
import app from '@/app'
import ENV from '@/configs/env.config'
import CONSTANT from '@/configs/constant.config'
import connectDB from '@/configs/mongoose.config'
import exitHook from 'exit-hook'
import { createBuckets } from './providers/minio.provider'
import redisProvider from './providers/redis.provider'

connectDB()
  .then(() => {
    console.log('[Server]: Connected to database')

    // Create buckets for minio
    createBuckets(CONSTANT.MINIO.BUCKETS)
      .then(() => {
        console.log('[Minio]: Connected to minio')
      })
      .catch(error => {
        console.log('[Minio]: Error connecting to minio', error)
      })

    // Init Redis
    redisProvider
      .initRedis()
      .then(() => {
        console.log('[Redis]: Connected to Redis')
      })
      .catch(error => {
        console.log('[Redis]: Error connecting to Redis', error)
      })

    app.listen(ENV.PORT, () => {
      console.log(`[Server]: Environment: ${ENV.NODE_ENV}`)
      console.log(`[Server]: Running at http://localhost:${ENV.PORT}`)
    })

    if (ENV.NODE_ENV === CONSTANT.NODE.DEV) {
      console.log(`[Server]: Running at http://localhost:${ENV.PORT}/api-docs`)
    }

    exitHook(() => {
      app.close(() => {
        console.log('[Server]: Server closed')
        process.exit(0)
      })
    })
  })
  .catch(error => {
    console.log('[Server]: Error starting server', error)
    process.exit(1)
  })
