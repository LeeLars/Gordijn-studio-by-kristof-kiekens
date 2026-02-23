import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/settings.json');

const router = Router();

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  console.log('Data directory path:', dir);
  if (!fs.existsSync(dir)) {
    console.log('Creating data directory...');
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log('Data directory exists');
  }
}

function readSettings() {
  console.log('Reading settings from:', DATA_FILE);
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    console.log('Settings file not found, creating defaults');
    const defaults = {
      contact: {
        telefoon: '0473 62 53 13',
        email: 'info@kristofkiekens.be',
        ondernemingsnummer: 'BE 0600.782.960'
      },
      images: {
        hero: '',
        stickyCircle: '',
        overOns: '',
        cta: '',
        aanbod: {
          overgordijnen: '',
          vouwgordijnen: '',
          rolgordijnen: '',
          houtenJaloezieen: '',
          lamellen: '',
          duoRoll: ''
        }
      },
      gallery: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  console.log('Settings loaded, gallery count:', data.gallery ? data.gallery.length : 0);
  return data;
}

function writeSettings(data) {
  console.log('Writing settings to:', DATA_FILE);
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log('Settings saved, gallery count:', data.gallery ? data.gallery.length : 0);
}

// GET settings
router.get('/settings', (req, res) => {
  try {
    const settings = readSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings read error:', error);
    res.status(500).json({ success: false, error: 'Kon instellingen niet laden' });
  }
});

// PUT settings - deep merge alle velden
router.put('/settings', (req, res) => {
  try {
    const current = readSettings();
    
    // Deep merge functie
    function deepMerge(target, source) {
      const output = Object.assign({}, target);
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
          if (isObject(source[key])) {
            if (!(key in target)) {
              Object.assign(output, { [key]: source[key] });
            } else {
              output[key] = deepMerge(target[key], source[key]);
            }
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    }
    
    function isObject(item) {
      return (item && typeof item === 'object' && !Array.isArray(item));
    }
    
    // Deep merge van current met req.body
    const updated = deepMerge(current, req.body);
    
    writeSettings(updated);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Settings write error:', error);
    res.status(500).json({ success: false, error: 'Kon instellingen niet opslaan' });
  }
});

export default router;
