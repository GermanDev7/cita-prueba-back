import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { config } from '../config/config';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';
import { DoctorService } from './DoctorService';

export class AuthService {
    constructor(private userRepo: UserRepository,
        private doctorService: DoctorService
    ) { }

    public async register(userData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: string;
        specialty?: string; 
    }): Promise<User> {
        //console.log("Data in AuthService.register:", userData);
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = new User(
            0,
            userData.firstName,
            userData.lastName,
            userData.email,
            hashedPassword,
            userData.role
        );
        //console.log(userData)

        const newUser = await this.userRepo.create(user);
        //console.log(userData)
        // Si el usuario es doctor, crea el perfil en DOCTORS automáticamente
        if (userData.role === 'doctor') {
            if (!userData.specialty) {
                throw new Error('Specialty is required for doctor registration');
            }
            await this.doctorService.createDoctor({
                userId: newUser.userId,
                specialty: userData.specialty,
            });
        }

        return newUser;
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