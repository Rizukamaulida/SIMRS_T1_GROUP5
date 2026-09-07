import { fhirRequest } from './satusehatAuth.js';

export async function sendConditionToSatuSehat({ encounterIhsId, patientIhsId, patientName, icd10Code, icd10Display }) {
  const payload = {
    resourceType: "Condition",
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
          display: "Active"
        }
      ]
    },
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-category",
            code: "encounter-diagnosis",
            display: "Encounter Diagnosis"
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: "http://hl7.org/fhir/sid/icd-10",
          code: icd10Code,
          display: icd10Display
        }
      ]
    },
    subject: {
      reference: `Patient/${patientIhsId}`,
      display: patientName
    },
    encounter: {
      reference: `Encounter/${encounterIhsId}`
    }
  };

  const response = await fhirRequest('POST', '/Condition', payload);
  return response.data.id;
}