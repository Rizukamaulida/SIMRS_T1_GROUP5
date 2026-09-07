// backend/src/services/fhirPatient.js
import { fhirRequest } from './satusehatAuth.js';

export async function findPatientByNik(nik) {
  try {
    // Format baku SATUSEHAT: https://fhir.kemkes.go.id/id/nik%7C<NIK>
    const endpoint = `/Patient?identifier=https://fhir.kemkes.go.id/id/nik%7C${nik}`;
    const res = await fhirRequest('GET', endpoint);

    const entries = res.data.entry;
    if (!entries || entries.length === 0) {
      return null;
    }

    const patientResource = entries[0].resource;
    return {
      ihs_id: patientResource.id,
      name: patientResource.name?.[0]?.text || patientResource.name?.[0]?.given?.join(' ') || 'Tanpa Nama',
      birthDate: patientResource.birthDate,
      gender: patientResource.gender
    };
  } catch (err) {
    console.error(`Gagal query NIK ${nik}:`, err.response?.data || err.message);
    throw err;
  }
}