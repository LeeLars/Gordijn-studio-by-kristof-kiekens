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
  origin: ['https://leelars.github.io', 'https://kristofkiekens.be', 'http://localhost:3000', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

// API routes
app.use('/api', apiRoutes);

// Admin static files
app.use('/cms', express.static(path.join(__dirname, 'cms-admin')));

// Statische website bestanden vanuit repo root
app.use('/web', express.static(path.join(__dirname, 'web')));
app.use('/robots.txt', express.static(path.join(__dirname, 'robots.txt')));
app.use('/sitemap.xml', express.static(path.join(__dirname, 'sitemap.xml')));

// 301 Redirects
app.get('/contact.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be/#contact');
});
app.get('/carpets.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be');
});
app.get('/diensten-en-producten.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be/#aanbod');
});
app.get('/info-partners.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be/#ervaring');
});
app.get('/interieur-en-kleuradvies.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be');
});
app.get('/muurbekleding.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be');
});
app.get('/raamdecoratie.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be/#aanbod');
});
app.get('/rails.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be');
});
app.get('/verf.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be');
});
app.get('/vloerbekleding.php', (req, res) => {
  res.redirect(301, 'https://kristofkiekens.be');
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Privacy pagina
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`CMS draait op poort ${env.port}`);
  console.log(`__dirname: ${__dirname}`);
});
