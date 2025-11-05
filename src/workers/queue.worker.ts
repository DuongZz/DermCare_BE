/* eslint-disable no-console */
import connectDB from '@/configs/mongoose.config'
import redisProvider from '@/providers/redis.provider'

connectDB()
  .then(() => {
    console.log('[Queue Worker]: Connected to database')
  })
  .catch(error => {
    console.log('[Queue Worker]: Error starting server', error)
    process.exit(1)
  })

redisProvider
  .initPushSub()
  .then(() => {
    console.log('[Queue Worker]: Connected to Redis')
  })
  .catch(error => {
    console.log('[Queue Worker]: Error connecting to Redis', error)
  })

