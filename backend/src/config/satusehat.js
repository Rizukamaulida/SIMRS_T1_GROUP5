import dotenv from 'dotenv';
dotenv.config();

export const SATUSEHAT_CONFIG = {
  authUrl: process.env.SATUSEHAT_AUTH_URL,
  fhirUrl: process.env.SATUSEHAT_FHIR_URL,
  clientId: process.env.SATUSEHAT_CLIENT_ID,
  clientSecret: process.env.SATUSEHAT_CLIENT_SECRET,
  organizationId: process.env.SATUSEHAT_ORG_ID,
  defaultPractitionerIhs: process.env.DEFAULT_PRACTITIONER_IHS,
  defaultPractitionerName: process.env.DEFAULT_PRACTITIONER_NAME,
  defaultLocationId: process.env.DEFAULT_LOCATION_ID,
  defaultLocationName: process.env.DEFAULT_LOCATION_NAME
};