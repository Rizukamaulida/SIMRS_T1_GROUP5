// backend/create-location.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function createDummyLocation() {
  // 1. Ambil Access Token
  const tokenParams = new URLSearchParams({
    client_id: process.env.SATUSEHAT_CLIENT_ID,
    client_secret: process.env.SATUSEHAT_CLIENT_SECRET
  });

  const authRes = await axios.post(
    `${process.env.SATUSEHAT_AUTH_URL}/accesstoken?grant_type=client_credentials`,
    tokenParams,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const token = authRes.data.access_token;
  console.log('Token didapat!');

  // 2. Buat Master Ruangan Dummy
  const locationPayload = {
    resourceType: "Location",
    identifier: [
      {
        system: `http://sys-ids.kemkes.go.id/location/${process.env.SATUSEHAT_ORG_ID}`,
        value: "Ruang Pemeriksaan Poli 1"
      }
    ],
    status: "active",
    name: "Ruang Pemeriksaan Poli 1",
    description: "Ruang Pemeriksaan Poli 1 untuk Testing Staging",
    mode: "instance",
    telecom: [
      {
        system: "phone",
        value: "021-1234567"
      }
    ],
    physicalType: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/location-physical-type",
          code: "ro",
          display: "Room"
        }
      ]
    },
    managingOrganization: {
      reference: `Organization/${process.env.SATUSEHAT_ORG_ID}`
    }
  };

  const locRes = await axios.post(
    `${process.env.SATUSEHAT_FHIR_URL}/Location`,
    locationPayload,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('BERHASIL MEMBUAT LOCATION!');
  console.log('ID LOCATION KAMU:', locRes.data.id);
}

createDummyLocation().catch(err => {
  console.error('Error:', err.response?.data || err.message);
});