// API client voor Gordijn Studio CMS
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
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
