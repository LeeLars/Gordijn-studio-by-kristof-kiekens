// API client voor Gordijn Studio CMS
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isRailway = window.location.hostname.includes('kristofkiekens.be') || window.location.hostname.includes('railway.app');
const API_BASE_URL = isLocal
  ? 'http://localhost:3000/api'
  : isRailway
    ? '/api'
    : 'https://gordijn-studio-by-kristof-kiekens-production.up.railway.app/api';

export async function fetchJson(path, options = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, options);
    if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
    }
    return res.json();
}

export async function sendContact(data) {
    return fetchJson('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}
