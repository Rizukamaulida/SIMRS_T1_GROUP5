import { fhirRequest } from './satusehatAuth.js';
import { SATUSEHAT_CONFIG } from '../config/satusehat.js';

export async function sendEncounterToSatuSehat({ patientIhsId, patientName, startTime }) {
  const payload = {
    resourceType: "Encounter",
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
      start: startTime || new Date().toISOString()
    },
    location: [
      {
        location: {
          reference: `Location/${SATUSEHAT_CONFIG.defaultLocationId}`,
          display: SATUSEHAT_CONFIG.defaultLocationName
        }
      }
    ],
    serviceProvider: {
      reference: `Organization/${SATUSEHAT_CONFIG.organizationId}`
    }
  };

  const response = await fhirRequest('POST', '/Encounter', payload);
  return response.data.id;
}

export async function updateEncounterStatusFinished(encounterIhsId, patientIhsId, patientName, startTime) {
  const payload = {
    resourceType: "Encounter",
    id: encounterIhsId,
    status: "finished",
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
      start: startTime,
      end: new Date().toISOString()
    },
    location: [
      {
        location: {
          reference: `Location/${SATUSEHAT_CONFIG.defaultLocationId}`,
          display: SATUSEHAT_CONFIG.defaultLocationName
        }
      }
    ],
    serviceProvider: {
      reference: `Organization/${SATUSEHAT_CONFIG.organizationId}`
    }
  };

  const response = await fhirRequest('PUT', `/Encounter/${encounterIhsId}`, payload);
  return response.data;
}