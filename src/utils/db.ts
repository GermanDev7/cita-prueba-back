import oracledb from 'oracledb'
import { config } from '../config/config';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export const dbConfig = {
    user: config.dbUser,
    password:config.dbPassword,
    connectString: config.dbConnectString,
    poolMin: 4,
    poolMax: 20,
    poolIncrement: 2,
    poolTimeout: 60,
    poolAlias: "default"
};

let pool: oracledb.Pool;

export async function initDBPool() {
    try {
        pool = await oracledb.createPool(dbConfig);
        //console.log('Connection pool started');

    } catch (err) {
        console.error('Failed to create pool', err);
        process.exit(1);
    }
}

export async function getConnection(): Promise<oracledb.Connection> {
    if (!pool) {
        throw new Error("Connection pool is not initialized. Call initDBPool() first.");
    }
    return pool.getConnection();
}
