import { fhirRequest } from './satusehatAuth.js';
import { SATUSEHAT_CONFIG } from '../config/satusehat.js';

export async function sendMedicationRequestToSatuSehat({
  encounterIhsId,
  patientIhsId,
  patientName,
  kfaCode,
  kfaDisplay,
  dosageText,
  quantity
}) {
  const authoredOn = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const rxNumber = `RX-${Date.now()}`;
  const medLocalId = `med-${Date.now()}`;

  const payload = {
    resourceType: "MedicationRequest",
    identifier: [
      {
        system: `http://sys-ids.kemkes.go.id/prescription/${SATUSEHAT_CONFIG.organizationId}`,
        use: "official",
        value: rxNumber
      },
      {
        system: `http://sys-ids.kemkes.go.id/prescription-item/${SATUSEHAT_CONFIG.organizationId}`,
        use: "official",
        value: `${rxNumber}-1`
      }
    ],
    status: "active",
    intent: "order",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
            code: "outpatient",
            display: "Outpatient"
          }
        ]
      }
    ],
    contained: [
      {
        resourceType: "Medication",
        id: medLocalId,
        identifier: [
          {
            system: `http://sys-ids.kemkes.go.id/medication/${SATUSEHAT_CONFIG.organizationId}`,
            use: "official",
            value: `MED-ITEM-${kfaCode}`
          }
        ],
        code: {
          coding: [
            {
              system: "http://sys-ids.kemkes.go.id/kfa",
              code: kfaCode,
              display: kfaDisplay
            }
          ]
        },
        status: "active",
        extension: [
          {
            url: "https://fhir.kemkes.go.id/r4/StructureDefinition/MedicationType",
            valueCodeableConcept: {
              coding: [
                {
                  system: "http://terminology.kemkes.go.id/CodeSystem/medication-type",
                  code: "NC",
                  display: "Non-compound"
                }
              ]
            }
          }
        ]
      }
    ],
    medicationReference: {
      reference: `#${medLocalId}`,
      display: kfaDisplay
    },
    subject: {
      reference: `Patient/${patientIhsId}`,
      display: patientName || "Pasien"
    },
    encounter: {
      reference: `Encounter/${encounterIhsId}`
    },
    authoredOn: authoredOn,
    requester: {
      reference: `Practitioner/${SATUSEHAT_CONFIG.defaultPractitionerIhs}`,
      display: SATUSEHAT_CONFIG.defaultPractitionerName
    },
    dosageInstruction: [
      {
        sequence: 1,
        text: dosageText || "3 kali sehari 1 tablet sesudah makan",
        timing: {
          repeat: {
            frequency: 3,
            period: 1,
            periodUnit: "d"
          }
        }
      }
    ],
    dispenseRequest: {
      dispenseInterval: {
        value: 1,
        unit: "days",
        system: "http://unitsofmeasure.org",
        code: "d"
      },
      validityPeriod: {
        start: authoredOn,
        end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      numberOfRepeatsAllowed: 0,
      quantity: {
        value: Number(quantity) || 10,
        unit: "TAB",
        system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
        code: "TAB"
      },
      expectedSupplyDuration: {
        value: 3,
        unit: "days",
        system: "http://unitsofmeasure.org",
        code: "d"
      }
    }
  };

  try {
    const response = await fhirRequest('POST', '/MedicationRequest', payload);
    return response.data.id;
  } catch (error) {
    console.error('❌ ERROR MEDICATION REQUEST SATUSEHAT:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}
