import { Router } from 'express';
import cloudinary from '../../config/cloudinary.js';

const router = Router();

const SETTINGS_PUBLIC_ID = 'gordijnstudio/settings/data';

// Default settings
const DEFAULT_SETTINGS = {
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

// Read settings from Cloudinary
async function readSettings() {
  try {
    console.log('Reading settings from Cloudinary...');
    
    // Try to get the existing settings file
    try {
      const result = await cloudinary.api.resource(SETTINGS_PUBLIC_ID, {
        resource_type: 'raw'
      });
      
      // Download and parse the JSON
      const response = await fetch(result.secure_url);
      const data = await response.json();
      
      console.log('Settings loaded from Cloudinary, gallery count:', data.gallery ? data.gallery.length : 0);
      return data;
    } catch (err) {
      // File doesn't exist yet, return defaults
      console.log('No settings file found in Cloudinary, using defaults');
      return { ...DEFAULT_SETTINGS };
    }
  } catch (error) {
    console.error('Error reading settings from Cloudinary:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

// Write settings to Cloudinary
async function writeSettings(data) {
  try {
    console.log('Writing settings to Cloudinary...');
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Upload as raw file to Cloudinary using data URI
    const base64String = Buffer.from(jsonString, 'utf-8').toString('base64');
    const dataUri = 'data:application/json;base64,' + base64String;
    
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: SETTINGS_PUBLIC_ID,
      resource_type: 'raw',
      overwrite: true
    });
    
    console.log('Settings saved to Cloudinary, gallery count:', data.gallery ? data.gallery.length : 0);
    return result;
  } catch (error) {
    console.error('Error writing settings to Cloudinary:', error);
    throw error;
  }
}

// GET settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await readSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings read error:', error);
    res.status(500).json({ success: false, error: 'Kon instellingen niet laden' });
  }
});

// PUT settings - deep merge alle velden
router.put('/settings', async (req, res) => {
  try {
    const current = await readSettings();
    
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
    
    await writeSettings(updated);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Settings write error:', error);
    res.status(500).json({ success: false, error: 'Kon instellingen niet opslaan: ' + error.message });
  }
});

export default router;
