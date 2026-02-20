import { Router } from 'express';
import healthRoutes from './health.routes.js';

const router = Router();

router.use(healthRoutes);

// Voeg hier later extra API routes toe, bv:
// import locationsRoutes from './locations.routes.js';
// router.use('/locations', locationsRoutes);

export default router;
