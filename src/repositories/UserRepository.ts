import { getConnection } from "../utils/db";
import oracledb from 'oracledb';
import { User } from "../models/User";

export class UserRepository {
    public async findByEmail(email: string): Promise<User | null> {
        const conn = await getConnection();
        try {
            const result = await conn.execute(
                `SELECT user_id, first_name, last_name, email, password, role 
                FROM USERS
                WHERE email = :email`,
                { email },
            );

            const row = result.rows?.[0];
            if (!row) {
                return null;
            }
            const typedRow = row as {
                USER_ID: number;
                FIRST_NAME: string;
                LAST_NAME: string;
                EMAIL: string;
                PASSWORD: string;
                ROLE: string;
            };

            return new User(
                typedRow.USER_ID,
                typedRow.FIRST_NAME,
                typedRow.LAST_NAME,
                typedRow.EMAIL,
                typedRow.PASSWORD,
                typedRow.ROLE
            );

        } finally {
            await conn.close()
        }
    }

    public async create(user: User): Promise<User> {
        const conn = await getConnection();
        try {

            const result = await conn.execute(
                `INSERT INTO USERS (user_id, first_name, last_name, email, password, role)
             VALUES (USER_SEQ.NEXTVAL, :firstName, :lastName, :email, :password, :role)
             RETURNING user_id INTO :outUserId`,
                {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password,
                    role: user.role,
                    outUserId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                },
                { autoCommit: true }
            );

            const userId = (result.outBinds as any).outUserId[0];
            user.userId = userId;
            return user;
        } finally {
            await conn.close();
        }
    }
}