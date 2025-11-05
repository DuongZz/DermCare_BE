/* eslint-disable no-console */
import { createClient, RedisClientOptions } from 'redis'
import ENV from '@/configs/env.config'

// Cache Redis Client
const cacheClient = createClient({
  socket: {
    host: ENV.REDIS.REDIS_HOST,
    port: ENV.REDIS.REDIS_PORT,
  },
  password: ENV.REDIS.PASSWORD,
} as RedisClientOptions)

cacheClient.on('connect', () => {
  console.log('[Cache Redis]: Cache Redis Client Connected')
})

cacheClient.on('error', err => {
  console.log('[Cache Redis]: Cache Redis Client Error', err)
})

// Push Redis Client
const pushClient = createClient({
  socket: {
    host: ENV.REDIS.REDIS_HOST,
    port: ENV.REDIS.REDIS_PORT,
  },
  password: ENV.REDIS.PASSWORD,
})

pushClient.on('connect', () => {
  console.log('[Push Redis]: Push Redis Client Connected')
})

pushClient.on('error', err => {
  console.log('[Push Redis]: Push Redis Client Error', err)
})

// Sub Redis Client
const subClient = createClient({
  socket: {
    host: ENV.REDIS.REDIS_HOST,
    port: ENV.REDIS.REDIS_PORT,
  },
  password: ENV.REDIS.PASSWORD,
})

subClient.on('connect', () => {
  console.log('[Sub Redis]: Sub Redis Client Connected')
})

subClient.on('error', err => {
  console.log('[Sub Redis]: Sub Redis Client Error', err)
})

const initRedis = async () => {
  try {
    await cacheClient.connect()
    await pushClient.connect()
    await subClient.connect()
  } catch (error) {
    console.log('[Redis]: Error connecting to the database', error)
  }
}

const initPushSub = async () => {
  try {
    await pushClient.connect()
    await subClient.connect()
  } catch (error) {
    console.log('[Redis]: Error connecting to the database', error)
  }
}

export default {
  cacheClient,
  pushClient,
  subClient,
  initRedis,
  initPushSub,
} as const
