import { fhirRequest } from './satusehatAuth.js';
import { SATUSEHAT_CONFIG } from '../config/satusehat.js';

export async function sendObservationComplaintToSatuSehat({ encounterIhsId, patientIhsId, patientName, complaintText }) {
  // Mundurkan waktu 3 menit agar aman dari validasi future date
  const issuedTime = new Date(Date.now() - 3 * 60 * 1000).toISOString();

  const payload = {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "exam",
            display: "Exam"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "281036007",
          display: "Chief complaint finding"
        }
      ]
    },
    subject: {
      reference: `Patient/${patientIhsId}`,
      display: patientName
    },
    encounter: {
      reference: `Encounter/${encounterIhsId}`
    },
    effectiveDateTime: issuedTime,
    issued: issuedTime,
    performer: [
      {
        reference: `Practitioner/${SATUSEHAT_CONFIG.defaultPractitionerIhs}`,
        display: SATUSEHAT_CONFIG.defaultPractitionerName
      }
    ],
    valueString: complaintText
  };

  try {
    const response = await fhirRequest('POST', '/Observation', payload);
    return response.data.id;
  } catch (error) {
    console.error('❌ ERROR OBSERVATION SATUSEHAT:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}