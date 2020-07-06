import axios from 'axios';
import https from 'https';
import fs from 'fs';

const httpsAgent = https.Agent({
  keepAlive: true,
  rejectUnauthorized: false
});
const backend = axios.create({
  baseURL:'https://localhost:9001/',
  httpsAgent: httpsAgent,
  headers: {'x-key':'h026U8fpFjMyFr0qTpe6fvbk5Wg8ldutgVsIIbsZ3zTzuXNOP0B8NfnoKfoFeY3x'}
});
export default backend;
