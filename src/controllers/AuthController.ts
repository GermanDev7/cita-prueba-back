import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
    constructor(private authService: AuthService) { }

    public register = async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, email, password, role, specialty } = req.body;
            const createUser = await this.authService.register({
                firstName,
                lastName,
                email,
                password,
                role,
                specialty,
            });
            res.status(201).json(createUser);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    };

    public login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const { token, userData } = await this.authService.login(email, password);

            res.status(200).json({ token, userData, role: userData.role });
        } catch (error) {
            res.status(401).json({ error: (error as Error).message });
        }
    };
}
