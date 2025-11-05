import redisProvider from "@/providers/redis.provider"

export const deleteCacheByPrefix = async (keyPrefix: string, exactKey?: string) => {
  let cursor = 0
  let keysToDelete: string[] = []

  do {
    const result = await redisProvider.cacheClient.scan(cursor, {
      MATCH: `${keyPrefix}*`,
      COUNT: 100,
    })

    cursor = result.cursor
    let keys = result.keys

    if (exactKey) {
      keys = keys.filter((key) => key === exactKey)
    }

    keysToDelete = [...keysToDelete, ...keys]

    if (keysToDelete.length >= 1000) {
      await redisProvider.cacheClient.del(keysToDelete)
      keysToDelete = []
    }
  } while (cursor !== 0)

  if (keysToDelete.length > 0) {
    await redisProvider.cacheClient.del(keysToDelete)
  }
}
