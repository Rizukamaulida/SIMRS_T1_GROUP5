import db from '../config/database.js';
import { sendConditionToSatuSehat } from '../services/fhirCondition.js';

export function addDiagnosis(req, res) {
  const { encounter_id, icd10_code, icd10_display } = req.body;

  const query = `
    SELECT e.*, p.name as patient_name, p.satusehat_ihs_id as patient_ihs_id
    FROM encounters e
    JOIN patients p ON e.patient_id = p.id
    WHERE e.id = ?
  `;

  db.get(query, [encounter_id], (err, enc) => {
    if (err || !enc) return res.status(404).json({ error: 'Encounter tidak ditemukan' });

    db.run(
      `INSERT INTO conditions (encounter_id, icd10_code, icd10_display, sync_status) VALUES (?, ?, ?, 'PENDING')`,
      [encounter_id, icd10_code, icd10_display],
      async function (dbErr) {
        if (dbErr) return res.status(500).json({ error: dbErr.message });
        const conditionId = this.lastID;

        // Jika encounter lokal sudah punya ID SatuSehat, kirim diagnosa
        if (enc.satusehat_encounter_id && enc.patient_ihs_id) {
          try {
            const ssCondId = await sendConditionToSatuSehat({
              encounterIhsId: enc.satusehat_encounter_id,
              patientIhsId: enc.patient_ihs_id,
              patientName: enc.patient_name,
              icd10Code: icd10_code,
              icd10Display: icd10_display
            });

            db.run(
              `UPDATE conditions SET satusehat_condition_id = ?, sync_status = 'SYNCED' WHERE id = ?`,
              [ssCondId, conditionId]
            );

            return res.status(201).json({ id: conditionId, satusehat_id: ssCondId, sync_status: 'SYNCED' });
          } catch (apiErr) {
            db.run(`UPDATE conditions SET sync_status = 'FAILED' WHERE id = ?`, [conditionId]);
          }
        }

        res.status(201).json({ id: conditionId, sync_status: 'FAILED / NO_ENCOUNTER_SYNC' });
      }
    );
  });
}

export function saveMedicalRecord(req, res) {
  const {
    encounter_id,
    anamnesis_keluhan_utama,
    anamnesis_keluhan_penyerta,
    anamnesis_alergi,
    anamnesis_riwayat_pribadi,
    anamnesis_riwayat_keluarga,
    anamnesis_riwayat_pengobatan,
    pemeriksaan_fisik_psikologis,
    catatan_permintaan_tindakan,
    catatan_resep_obat
  } = req.body;

  if (!encounter_id) {
    return res.status(400).json({ error: 'encounter_id wajib diisi' });
  }

  const query = `
    INSERT INTO medical_records (
      encounter_id,
      anamnesis_keluhan_utama,
      anamnesis_keluhan_penyerta,
      anamnesis_alergi,
      anamnesis_riwayat_pribadi,
      anamnesis_riwayat_keluarga,
      anamnesis_riwayat_pengobatan,
      pemeriksaan_fisik_psikologis,
      catatan_permintaan_tindakan,
      catatan_resep_obat
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      encounter_id,
      anamnesis_keluhan_utama || null,
      anamnesis_keluhan_penyerta || null,
      anamnesis_alergi || null,
      anamnesis_riwayat_pribadi || null,
      anamnesis_riwayat_keluarga || null,
      anamnesis_riwayat_pengobatan || null,
      pemeriksaan_fisik_psikologis || null,
      catatan_permintaan_tindakan || null,
      catatan_resep_obat || null
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Rekam medis berhasil disimpan secara lokal' });
    }
  );
}
