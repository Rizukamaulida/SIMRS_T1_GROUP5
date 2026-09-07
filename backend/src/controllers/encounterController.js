import db from '../config/database.js';
import { sendEncounterToSatuSehat, updateEncounterStatusFinished } from '../services/fhirEncounter.js';
import { SATUSEHAT_CONFIG } from '../config/satusehat.js';

export function createEncounter(req, res) {
  const { patient_id } = req.body;

  db.get('SELECT * FROM patients WHERE id = ?', [patient_id], async (err, patient) => {
    if (err || !patient) return res.status(404).json({ error: 'Pasien tidak ditemukan' });

    const startTime = new Date().toISOString();

    // 1. Simpan dulu ke DB Lokal
    db.run(
      `INSERT INTO encounters (patient_id, doctor_name, status, sync_status) VALUES (?, ?, 'arrived', 'PENDING')`,
      [patient.id, SATUSEHAT_CONFIG.defaultPractitionerName],
      async function (dbErr) {
        if (dbErr) return res.status(500).json({ error: dbErr.message });
        const localEncounterId = this.lastID;

        // 2. Sync ke SatuSehat
        try {
          const satusehatId = await sendEncounterToSatuSehat({
            patientIhsId: patient.satusehat_ihs_id,
            patientName: patient.name,
            startTime
          });

          // Update status lokal
          db.run(
            `UPDATE encounters SET satusehat_encounter_id = ?, sync_status = 'SYNCED' WHERE id = ?`,
            [satusehatId, localEncounterId]
          );

          res.status(201).json({
            id: localEncounterId,
            satusehat_encounter_id: satusehatId,
            status: 'arrived',
            sync_status: 'SYNCED'
          });
        } catch (syncErr) {
          db.run(`UPDATE encounters SET sync_status = 'FAILED' WHERE id = ?`, [localEncounterId]);
          res.status(201).json({
            id: localEncounterId,
            satusehat_encounter_id: null,
            status: 'arrived',
            sync_status: 'FAILED',
            warning: 'Tersimpan di lokal, namun sinkronisasi SatuSehat tertunda'
          });
        }
      }
    );
  });
}

export function getAllEncounters(req, res) {
  const query = `
    SELECT e.*, p.name as patient_name, p.nik, p.satusehat_ihs_id as patient_ihs_id
    FROM encounters e
    JOIN patients p ON e.patient_id = p.id
    ORDER BY e.id DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}

export function finishEncounter(req, res) {
  const { id } = req.params;

  const query = `
    SELECT e.*, p.name as patient_name, p.satusehat_ihs_id as patient_ihs_id
    FROM encounters e
    JOIN patients p ON e.patient_id = p.id
    WHERE e.id = ?
  `;

  db.get(query, [id], async (err, encounter) => {
    if (err || !encounter) return res.status(404).json({ error: 'Kunjungan tidak ditemukan' });

    try {
      if (encounter.satusehat_encounter_id) {
        await updateEncounterStatusFinished(
          encounter.satusehat_encounter_id,
          encounter.patient_ihs_id,
          encounter.patient_name,
          encounter.created_at
        );
      }

      db.run(`UPDATE encounters SET status = 'finished' WHERE id = ?`, [id], (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        res.json({ message: 'Kunjungan selesai dan di-update ke SatuSehat' });
      });
    } catch (e) {
      res.status(500).json({ error: 'Gagal update status di SatuSehat: ' + e.message });
    }
  });
}