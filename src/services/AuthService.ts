import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { config } from '../config/config';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';

export class AuthService {
    constructor(private userRepo: UserRepository) { }

    public async register(userData: {
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        role: string;
    }): Promise<User> {
        //Hash
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = new User(
            0,
            userData.firstName,
            userData.lastName,
            userData.email,
            hashedPassword,
            userData.role
        );

        return this.userRepo.create(user);
    }

    public async login(email: string, password: string): Promise<string> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        //create JWT
        const token = jwt.sign(
            {
                userId: user.userId,
                role: user.role
            },
            config.jwtSecret,
            { expiresIn: '1h' }
        );
        return token;
    }
}