import oracledb from 'oracledb'

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 4,
    poolMax: 20,
    poolIncrement: 2,
    poolTimeout: 60
};

export async function initDBPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');

    } catch (err) {
        console.error('Failed to create pool', err);
        process.exit(1);
    }
}

export async function getConnection(): Promise<oracledb.Connection> {
    try {
        return await oracledb.getConnection();
    } catch (err) {
        console.error('Error closing pool', err);
        throw err;
    }
}
