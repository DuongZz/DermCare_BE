import { Connection, createConnection, getConnectionManager } from 'typeorm';

import config from './config/ormconfig';

export const dbCreateConnection = async (): Promise<Connection | null> => {
  try {
    const connectionManager = getConnectionManager();
    if (connectionManager.has('default')) {
      const oldConnection = connectionManager.get('default');
      if (oldConnection.isConnected) {
        await oldConnection.close();
        console.log('Closed stale database connection.');
      }

      // Xóa hoàn toàn connection cũ khỏi TypeORM cache để tạo lại mới
      // @ts-ignore
      if (connectionManager.connectionMap) {
        // @ts-ignore
        connectionManager.connectionMap.delete('default');
      } else {
        const index = connectionManager.connections.findIndex((c) => c.name === 'default');
        if (index !== -1) {
          connectionManager.connections.splice(index, 1);
        }
      }
    }

    const conn = await createConnection(config);
    console.log(`Database connection success. Connection name: '${conn.name}' Database: '${conn.options.database}'`);
    console.log(`Registered entities: ${conn.entityMetadatas.map((m) => m.name).join(', ')}`);

    if (conn.entityMetadatas.length === 0) {
      console.warn('WARNING: No entities were registered! Check your ormconfig.ts glob paths.');
    }
    return conn;
  } catch (err) {
    console.error('Database connection error:', err);
    const connectionManager = getConnectionManager();
    // Xóa connection lỗi (chưa có entities do lỗi ở bước connect) khỏi bộ nhớ
    // @ts-ignore
    if (connectionManager.connectionMap) {
      // @ts-ignore
      connectionManager.connectionMap.delete('default');
    } else {
      const index = connectionManager.connections.findIndex((c) => c.name === 'default');
      if (index !== -1) {
        connectionManager.connections.splice(index, 1);
      }
    }
    // Ném lỗi để Node.js process có thể restart (cần thiết cho PM2/Docker/Render)
    throw err;
  }
  return null;
};
