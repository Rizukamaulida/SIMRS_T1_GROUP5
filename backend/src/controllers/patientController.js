import db from '../config/database.js';
import { findPatientByNik } from '../services/fhirPatient.js';

export async function lookupAndRegisterPatient(req, res) {
  const { nik } = req.body;
  if (!nik || nik.length !== 16) {
    return res.status(400).json({ error: 'NIK wajib 16 digit' });
  }

  // Cek lokal terlebih dahulu
  db.get('SELECT * FROM patients WHERE nik = ?', [nik], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      return res.json({ message: 'Data ditemukan di lokal', data: row });
    }

    // Jika tidak ada di lokal, cari ke SatuSehat
    try {
      const patient = await findPatientByNik(nik);
      if (!patient) {
        return res.status(404).json({ error: 'Pasien tidak terdaftar di SatuSehat/Dukcapil' });
      }

      // Simpan ke SQLite
      const stmt = db.prepare(`
        INSERT INTO patients (nik, name, birth_date, gender, satusehat_ihs_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(nik, patient.name, patient.birthDate, patient.gender, patient.ihs_id, function (insertErr) {
        if (insertErr) return res.status(500).json({ error: insertErr.message });
        res.status(201).json({
          message: 'Berhasil lookup SatuSehat & tersimpan ke SIMRS',
          data: {
            id: this.lastID,
            nik,
            name: patient.name,
            birth_date: patient.birthDate,
            gender: patient.gender,
            satusehat_ihs_id: patient.ihs_id
          }
        });
      });
      stmt.finalize();
    } catch (apiErr) {
      console.error('DETAIL ERROR SATUSEHAT:', apiErr.response?.status, apiErr.response?.data || apiErr.message);
      res.status(500).json({ 
        error: apiErr.response?.data?.issue?.[0]?.details?.text || apiErr.response?.data || 'Gagal komunikasi dengan SatuSehat API' 
      });
    }
  });
}

export function getAllPatients(req, res) {
  db.all('SELECT * FROM patients ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}