import dotenv from 'dotenv';
dotenv.config();

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: getEnv('JWT_SECRET'),
  dbUser: getEnv('DB_USER'),
  dbPassword: getEnv('DB_PASSWORD'),
  dbConnectString: getEnv('DB_CONNECT_STRING') || 'localhost:1521/free',
};