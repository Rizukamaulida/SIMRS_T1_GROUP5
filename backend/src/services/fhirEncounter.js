import axios from 'axios';
import { fhirRequest, getAccessToken } from './satusehatAuth.js';
import { SATUSEHAT_CONFIG } from '../config/satusehat.js';

export async function sendEncounterToSatuSehat({ patientIhsId, patientName, startTime }) {
  const visitNumber = `REG-${Date.now()}`;
  
  // Ambil waktu 10 menit yang lalu (UTC standar dengan akhiran Z yang valid)
  const safeStartTime = startTime || new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const payload = {
    resourceType: "Encounter",
    identifier: [
      {
        system: `http://sys-ids.kemkes.go.id/encounter/${SATUSEHAT_CONFIG.organizationId}`,
        value: visitNumber
      }
    ],
    status: "arrived",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: "AMB",
      display: "ambulatory"
    },
    subject: {
      reference: `Patient/${patientIhsId}`,
      display: patientName
    },
    participant: [
      {
        type: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                code: "ATND",
                display: "attender"
              }
            ]
          }
        ],
        individual: {
          reference: `Practitioner/${SATUSEHAT_CONFIG.defaultPractitionerIhs}`,
          display: SATUSEHAT_CONFIG.defaultPractitionerName
        }
      }
    ],
    period: {
      start: safeStartTime
    },
    location: [
      {
        location: {
          reference: `Location/${SATUSEHAT_CONFIG.defaultLocationId}`,
          display: SATUSEHAT_CONFIG.defaultLocationName
        }
      }
    ],
    statusHistory: [
      {
        status: "arrived",
        period: {
          start: safeStartTime
        }
      }
    ],
    serviceProvider: {
      reference: `Organization/${SATUSEHAT_CONFIG.organizationId}`
    }
  };

  try {
    const response = await fhirRequest('POST', '/Encounter', payload);
    return response.data.id;
  } catch (error) {
    console.error('❌ ERROR ENCOUNTER SATUSEHAT:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

<<<<<<< HEAD
// backend/src/services/fhirEncounter.js

// backend/src/services/fhirEncounter.js

export async function updateEncounterStatusFinished(encounterIhsId, patientIhsId, patientName, startTime) {
  try {
    const token = await getAccessToken();

=======
export async function updateEncounterStatusFinished(encounterIhsId, patientIhsId, patientName, startTime) {
  try {
    const token = await getAccessToken();

>>>>>>> e41d4bdb8d134e2706a0a35ff157eaea5854b734
    // 1. Ambil data Encounter asli dari SATUSEHAT untuk mendapatkan period.start yang valid
    const existing = await axios.get(
      `${SATUSEHAT_CONFIG.fhirUrl}/Encounter/${encounterIhsId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const arrivedStart = existing.data?.period?.start || new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    // 2. Tentukan endPeriod minimal 2 menit setelah arrivedStart, tapi tidak boleh masa depan
    const startDateObj = new Date(arrivedStart);
    let endDateObj = new Date(startDateObj.getTime() + 2 * 60 * 1000); // +2 menit dari start
    
    const nowObj = new Date();
    // Jika +2 menit masih melebihi waktu sekarang, mundurkan beberapa detik sebelum now
    if (endDateObj > nowObj) {
      endDateObj = new Date(nowObj.getTime() - 10 * 1000);
    }
    // Jika start ternyata sama atau lebih baru dari now, paksa end = start + 1 detik
    if (endDateObj <= startDateObj) {
      endDateObj = new Date(startDateObj.getTime() + 1000);
    }

    const endPeriod = endDateObj.toISOString();

    // 3. Susun JSON Patch sesuai spesifikasi resmi SATUSEHAT R4
    const patchPayload = [
      {
        op: "replace",
        path: "/status",
        value: "finished"
      },
      {
        op: "add",
        path: "/period/end",
        value: endPeriod
      },
      {
        op: "add",
        path: "/statusHistory/0/period/end",
        value: endPeriod
      },
      {
        op: "add",
        path: "/statusHistory/-",
        value: {
          status: "finished",
          period: {
            start: endPeriod,
            end: endPeriod
          }
        }
      }
    ];

    const response = await axios({
      method: 'PATCH',
      url: `${SATUSEHAT_CONFIG.fhirUrl}/Encounter/${encounterIhsId}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json-patch+json'
      },
      data: patchPayload
    });

    return response.data;
  } catch (error) {
    console.error('❌ ERROR FINISH ENCOUNTER (PATCH):');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}