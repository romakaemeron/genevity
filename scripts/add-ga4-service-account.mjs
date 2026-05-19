/**
 * One-time script: grants the GA4 service account Viewer access to property 533683637.
 * Run: node scripts/add-ga4-service-account.mjs
 */
import { OAuth2Client } from 'google-auth-library';
import { createServer } from 'http';
import open from 'open';

const SERVICE_ACCOUNT_EMAIL = 'genevity-analytics@genevity-analytics.iam.gserviceaccount.com';
const PROPERTY_ID = '533683637';
const PORT = 9876;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

import { readFileSync } from 'fs';
const oauthCreds = JSON.parse(readFileSync(new URL('../client_secret_996118789186-nsutsjft3aukd7o5ukcklccu7osrb27u.apps.googleusercontent.com.json', import.meta.url)));
const CLIENT_ID = oauthCreds.installed.client_id;
const CLIENT_SECRET = oauthCreds.installed.client_secret;

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/analytics.manage.users',
    'https://www.googleapis.com/auth/analytics.readonly',
  ],
  prompt: 'consent',
});

console.log('\n🔐 Opening browser for Google authentication...');
console.log('   If browser does not open, visit:\n  ', authUrl, '\n');

await open(authUrl);

// Wait for OAuth callback
const code = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const code = url.searchParams.get('code');
    if (code) {
      res.end('<h2>✅ Authenticated! Close this tab and return to terminal.</h2>');
      server.close();
      resolve(code);
    } else {
      res.end('<h2>❌ No code received</h2>');
      reject(new Error('No code'));
    }
  });
  server.listen(PORT, () => console.log(`Waiting for auth callback on port ${PORT}...`));
  setTimeout(() => { server.close(); reject(new Error('Timeout')); }, 120_000);
});

const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);
console.log('✅ Authenticated successfully\n');

// Call Analytics Admin API to create access binding
const accessToken = tokens.access_token;
const url = `https://analyticsadmin.googleapis.com/v1alpha/properties/${PROPERTY_ID}/accessBindings`;

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user: SERVICE_ACCOUNT_EMAIL,
    roles: ['predefinedRoles/viewer'],
  }),
});

const data = await res.json();

if (res.ok) {
  console.log('✅ Service account added to GA4 property!');
  console.log('   Binding:', data.name);
} else {
  console.error('❌ Failed:', JSON.stringify(data, null, 2));
}
