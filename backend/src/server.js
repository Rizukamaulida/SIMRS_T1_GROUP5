import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { sendObservationComplaintToSatuSehat } from './services/fhirObservation.js';
import { sendMedicationRequestToSatuSehat } from './services/fhirMedication.js';
import { sendConditionToSatuSehat } from './services/fhirCondition.js';
<<<<<<< HEAD
import { updateEncounterStatusFinished } from './services/fhirEncounter.js'; // <-- 1. Import fungsi close encounter
import db from './config/database.js'; // pastikan path sesuai lokasi file database.js Anda
=======
import { updateEncounterStatusFinished } from './services/fhirEncounter.js';
import db from './config/database.js';
>>>>>>> e41d4bdb8d134e2706a0a35ff157eaea5854b734

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', message: 'SIMRS Backend is Running' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'SIMRS Backend is Running' });
});

// Endpoint Keluhan / Anamnesis (SATUSEHAT FHIR Observation)
app.post('/api/rme/complaint', async (req, res) => {
  try {
    const { encounterIhsId, patientIhsId, patientName, complaintText } = req.body;
    if (!complaintText) {
      return res.status(400).json({ error: 'Keluhan tidak boleh kosong' });
    }
    const observationId = await sendObservationComplaintToSatuSehat({
      encounterIhsId,
      patientIhsId,
      patientName,
      complaintText
    });
    res.json({ success: true, observationId });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Endpoint Resep Obat (SATUSEHAT FHIR MedicationRequest)
app.post('/api/rme/prescription', async (req, res) => {
  try {
    const { encounterIhsId, patientIhsId, patientName, kfaCode, kfaDisplay, dosageText, quantity } = req.body;
    const medicationRequestId = await sendMedicationRequestToSatuSehat({
      encounterIhsId,
      patientIhsId,
      patientName,
      kfaCode,
      kfaDisplay,
      dosageText,
      quantity
    });
    res.json({ success: true, medicationRequestId });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Endpoint Diagnosa ICD-10 (SATUSEHAT FHIR Condition)
app.post('/api/condition', async (req, res) => {
  try {
    const { encounterIhsId, patientIhsId, patientName, icd10Code, icd10Display } = req.body;
    const conditionId = await sendConditionToSatuSehat({
      encounterIhsId,
      patientIhsId,
      patientName,
      icd10Code,
      icd10Display
    });
    res.json({ success: true, conditionId });
  } catch (error) {
    console.error('Error endpoint condition:', error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Endpoint Close Encounter (SATUSEHAT FHIR Encounter PATCH & DB local update)
app.post('/api/encounter/close', async (req, res) => {
  try {
    const { encounterId, encounterIhsId, patientIhsId, patientName, startTime } = req.body;

    let result = null;
    // 1. Kirim update status "finished" ke SATUSEHAT Cloud jika mempunya encounterIhsId
    if (encounterIhsId) {
      result = await updateEncounterStatusFinished(encounterIhsId, patientIhsId, patientName, startTime);
    }

    // 2. Update status kunjungan di database lokal SQLite
    const sql = `
      UPDATE encounters 
      SET status = 'finished' 
      WHERE id = ? OR satusehat_encounter_id = ?
    `;

    db.run(sql, [encounterId, encounterIhsId], function (err) {
      if (err) {
        console.error('❌ Gagal update status lokal:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(`✅ Status encounter lokal berhasil diubah ke finished (Rows affected: ${this.changes})`);
      res.json({ 
        success: true, 
        message: 'Encounter berhasil diselesaikan di SATUSEHAT dan database lokal', 
        result 
      });
    });

  } catch (error) {
    console.error('Error endpoint close encounter:', error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Endpoint Keluhan / Anamnesis
app.post('/api/rme/complaint', async (req, res) => {
  try {
    const { encounterIhsId, patientIhsId, patientName, complaintText } = req.body;
    if (!complaintText) {
      return res.status(400).json({ error: 'Keluhan tidak boleh kosong' });
    }
    const observationId = await sendObservationComplaintToSatuSehat({
      encounterIhsId,
      patientIhsId,
      patientName,
      complaintText
    });
    res.json({ success: true, observationId });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Endpoint Resep Obat (KFA)
app.post('/api/rme/prescription', async (req, res) => {
  try {
    const { encounterIhsId, patientIhsId, patientName, kfaCode, kfaDisplay, dosageText, quantity } = req.body;
    const medicationRequestId = await sendMedicationRequestToSatuSehat({
      encounterIhsId,
      patientIhsId,
      patientName,
      kfaCode,
      kfaDisplay,
      dosageText,
      quantity
    });
    res.json({ success: true, medicationRequestId });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Endpoint Diagnosa ICD-10
app.post('/api/condition', async (req, res) => {
  try {
    const { encounterIhsId, patientIhsId, patientName, icd10Code } = req.body;
    const conditionId = await sendConditionToSatuSehat({
      encounterIhsId,
      patientIhsId,
      patientName,
      icd10Code
    });
    res.json({ success: true, conditionId });
  } catch (error) {
    console.error('Error endpoint condition:', error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// <-- 2. Endpoint Menutup Encounter (Close Encounter) yang dicari frontend
// Endpoint Menutup Encounter (Close Encounter)
// Endpoint Menutup Encounter (Close Encounter)
app.post('/api/encounter/close', async (req, res) => {
  try {
    const { encounterId, encounterIhsId, patientIhsId, patientName, startTime } = req.body;

    // 1. Kirim update status "finished" ke SATUSEHAT Cloud
    const result = await updateEncounterStatusFinished(encounterIhsId, patientIhsId, patientName, startTime);

    // 2. Update status kunjungan di database lokal SQLite (kolom resmi: id & satusehat_encounter_id)
    const sql = `
      UPDATE encounters 
      SET status = 'FINISHED' 
      WHERE id = ? OR satusehat_encounter_id = ?
    `;

    db.run(sql, [encounterId, encounterIhsId], function (err) {
      if (err) {
        console.error('❌ Gagal update status lokal:', err.message);
      } else {
        console.log(`✅ Status encounter lokal berhasil diubah ke FINISHED (Rows affected: ${this.changes})`);
      }
      res.json({ 
        success: true, 
        message: 'Encounter berhasil diselesaikan di SATUSEHAT dan database lokal', 
        result 
      });
    });

  } catch (error) {
    console.error('Error endpoint close encounter:', error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SIMRS Server listening on http://localhost:${PORT}`);
});