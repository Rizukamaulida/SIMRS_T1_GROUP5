import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../simrs.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Gagal koneksi ke SQLite database:', err.message);
  } else {
    console.log(' Connected to SQLite database:', dbPath);
  }
});

// Setup tabel
db.serialize(() => {
  // Tabel Pasien
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nik TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      birth_date TEXT,
      gender TEXT,
      satusehat_ihs_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabel Kunjungan (Encounter)
  db.run(`
    CREATE TABLE IF NOT EXISTS encounters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_name TEXT,
      status TEXT DEFAULT 'arrived', -- arrived, in-progress, finished
      satusehat_encounter_id TEXT,
      sync_status TEXT DEFAULT 'PENDING', -- PENDING, SYNCED, FAILED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Tabel Diagnosa (Condition)
  db.run(`
    CREATE TABLE IF NOT EXISTS conditions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      encounter_id INTEGER NOT NULL,
      icd10_code TEXT NOT NULL,
      icd10_display TEXT NOT NULL,
      satusehat_condition_id TEXT,
      sync_status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (encounter_id) REFERENCES encounters(id)
    )
  `);
});

export default db;