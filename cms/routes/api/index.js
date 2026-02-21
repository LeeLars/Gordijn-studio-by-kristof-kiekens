import { Router } from 'express';
import healthRoutes from './health.routes.js';
import contactRoutes from './contact.routes.js';
import settingsRoutes from './settings.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(contactRoutes);
router.use(settingsRoutes);
router.use(uploadRoutes);

export default router;
