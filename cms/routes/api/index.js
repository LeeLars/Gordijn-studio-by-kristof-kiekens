import { Router } from 'express';
import healthRoutes from './health.routes.js';
import contactRoutes from './contact.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(contactRoutes);

export default router;
