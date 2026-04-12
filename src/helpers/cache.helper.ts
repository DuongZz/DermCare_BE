import { redisClient } from '../configs/redis';

export const deleteCacheByPrefix = async (keyPrefix: string, exactKey?: string) => {
  // ioredis sử dụng cursor là kiểu string ('0' khi bắt đầu và kết thúc)
  let cursor = '0';
  let keysToDelete: string[] = [];

  try {
    do {
      // Cú pháp đặc thù của ioredis: truyền thông số theo dạng Array arguments
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', `${keyPrefix}*`, 'COUNT', 100);

      cursor = nextCursor;
      let currentKeys = keys;

      if (exactKey) {
        currentKeys = currentKeys.filter((key) => key === exactKey);
      }

      keysToDelete = [...keysToDelete, ...currentKeys];

      // Cơ chế tự xả lũ: Gom rác đến 1000 file thì hốt đi 1 lần cho nhẹ RAM
      if (keysToDelete.length >= 1000) {
        await redisClient.del(...keysToDelete);
        keysToDelete = [];
      }
    } while (cursor !== '0');

    // Quét dọn nốt số rác cặn còn sót lại
    if (keysToDelete.length > 0) {
      await redisClient.del(...keysToDelete);
    }
  } catch (error) {
    console.error(`[Cache Helper Error] Không thể xóa cache theo nhóm prefix ${keyPrefix}:`, error);
  }
};
