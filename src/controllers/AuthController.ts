import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
    constructor(private authService: AuthService) { }

    public register = async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, email, password, role } = req.body;
            const user = await this.authService.register({
                firstName,
                lastName,
                email,
                password,
                role,
            });
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    };

    public login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const token = await this.authService.login(email, password);
            res.status(200).json({ token });
        } catch (error) {
            res.status(401).json({ error: (error as Error).message });
        }
    };
}
