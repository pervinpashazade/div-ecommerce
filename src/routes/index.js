import { Router } from 'express'
import { authRoutes } from './auth.routes.js';
export const v1Router = Router();

v1Router.get('/health', (req, res) => {
    res.send('OK');
});

v1Router.use('/auth', authRoutes);