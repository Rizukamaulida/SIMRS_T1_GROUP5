import express from 'express';
import { lookupAndRegisterPatient, getAllPatients } from '../controllers/patientController.js';
import { createEncounter, getAllEncounters, finishEncounter } from '../controllers/encounterController.js';
import { addDiagnosis, saveMedicalRecord } from '../controllers/medicalRecordController.js';

const router = express.Router();

// Pasien
router.post('/patients/lookup', lookupAndRegisterPatient);
router.get('/patients', getAllPatients);

// Kunjungan (Encounter)
router.post('/encounters', createEncounter);
router.get('/encounters', getAllEncounters);
router.put('/encounters/:id/finish', finishEncounter);

// Diagnosa (Condition) & Medical Records
router.post('/conditions', addDiagnosis);
router.post('/medical-records', saveMedicalRecord);

export default router;