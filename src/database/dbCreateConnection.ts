import { Connection, createConnection } from 'typeorm';

import config from './config/ormconfig';

export const dbCreateConnection = async (): Promise<Connection | null> => {
  try {
    const conn = await createConnection(config);
    console.log(`Database connection success. Connection name: '${conn.name}' Database: '${conn.options.database}'`);
    console.log(`Registered entities: ${conn.entityMetadatas.map((m) => m.name).join(', ')}`);
    if (conn.entityMetadatas.length === 0) {
      console.warn('WARNING: No entities were registered! Check your ormconfig.ts glob paths.');
    }
  } catch (err) {
    console.log(err);
  }
  return null;
};
