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