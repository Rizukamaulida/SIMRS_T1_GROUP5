// backend/src/services/satusehatAuth.js
import axios from 'axios';
import { SATUSEHAT_CONFIG } from '../config/satusehat.js';

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('client_id', SATUSEHAT_CONFIG.clientId);
    params.append('client_secret', SATUSEHAT_CONFIG.clientSecret);

    const response = await axios.post(
      `${SATUSEHAT_CONFIG.authUrl}/accesstoken?grant_type=client_credentials`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    cachedToken = response.data.access_token;
    tokenExpiresAt = now + (response.data.expires_in * 1000);
    console.log('✅ SatuSehat Token Diperbarui!');
    return cachedToken;
  } catch (error) {
    console.error('❌ Gagal otentikasi ke SatuSehat:', error.response?.data || error.message);
    throw new Error('Gagal mendapatkan token SatuSehat');
  }
}

export async function fhirRequest(method, endpoint, data = null) {
  const token = await getAccessToken();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${SATUSEHAT_CONFIG.fhirUrl}${cleanEndpoint}`;

  const headers = {
    'Authorization': `Bearer ${token}`
  };

  // Hanya sertakan Content-Type jika bukan method GET
  if (method.toUpperCase() !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    url,
    headers
  };

  if (data && method.toUpperCase() !== 'GET') {
    config.data = data;
  }

  return axios(config);
}