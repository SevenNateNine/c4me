import axios from 'axios';

// The API base URL and the x-key gate come from the build environment rather
// than being baked in here. Create a .env.local (gitignored) with:
//
//   REACT_APP_API_URL=https://localhost:9001/
//   REACT_APP_API_KEY=<the same value as config.keys in backend/config.json>
//
// REACT_APP_API_KEY is not a secret. Anything handed to a browser bundle is
// readable by whoever runs the browser; it is a deployment gate that keeps
// stray clients off the API, and the JWT is what actually authorizes a request.
const baseURL = process.env.REACT_APP_API_URL || 'https://localhost:9001/';
const apiKey = process.env.REACT_APP_API_KEY || '';

if (!apiKey) {
  console.warn('REACT_APP_API_KEY is not set — API requests will be rejected with 401.');
}

// No custom https agent. The previous one set rejectUnauthorized:false, which
// accepts any certificate from any server and gives up the guarantee HTTPS is
// there to provide. In development, trust ssl/server.cert in the browser or the
// OS keychain instead of switching verification off.
const backend = axios.create({
  baseURL: baseURL,
  headers: {'x-key': apiKey}
});

export default backend;
