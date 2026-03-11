import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure helmet with CSP allowing Cloudinary images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cloud.umami.is"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://cloud.umami.is"],
    },
  },
}));
// Configure CORS to allow GitHub Pages, kristofkiekens.be and local development
app.use(cors({
  origin: ['https://leelars.github.io', 'https://www.kristofkiekens.be', 'https://kristofkiekens.be', 'http://localhost:3000', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

// API routes
app.use('/api', apiRoutes);

// Admin static files
app.use('/cms', express.static(path.join(__dirname, 'public')));

// Statische website bestanden vanuit site/
const siteDir = path.join(__dirname, 'site');
app.use('/web', express.static(path.join(siteDir, 'web')));
app.use('/robots.txt', express.static(path.join(siteDir, 'robots.txt')));
app.use('/sitemap.xml', express.static(path.join(siteDir, 'sitemap.xml')));

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(siteDir, 'index.html'));
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`CMS draait op poort ${env.port}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`siteDir: ${siteDir}`);
});
