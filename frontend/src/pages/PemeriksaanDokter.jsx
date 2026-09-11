import React, { useState } from 'react';
import axios from 'axios';
import Icd10Search from '../components/Icd10Search';

// ================== LOGIC & DATA PERSIS SEPERTI SISTEM CONNECT (tidak diubah) ==================
// Catatan: master ICD-10 sekarang diambil dari frontend/public/icd10.json (2048 kode resmi),
// bukan lagi 4 kode hardcode. Lihat komponen Icd10Search.

// 1. Master KFA Kemenkes
const KFA_DRUGS = [
  { code: '93000572', name: 'Paracetamol 500 mg Tablet' },
  { code: '93000854', name: 'Amoxicillin 500 mg Kapsul' },
  { code: '93001018', name: 'Antasida Doen Tablet Kunyah' },
  { code: '93000632', name: 'Cetirizine 10 mg Tablet' }
];

export default function PemeriksaanDokter({ encounter, onFinished }) {
  // Normalisasi ID dan nama pasien
  const encounterId = encounter?.satusehat_encounter_id || encounter?.encounter_satusehat_id || encounter?.satusehat_id;
  const patientIhs = encounter?.satusehat_patient_id || encounter?.patient_ihs_id;
  const patientName = encounter?.patient_name || encounter?.nama_pasien || 'Pasien';

  // State Diagnosa ICD-10 (menyimpan objek {code, display} hasil pilihan dari master icd10.json)
  const [selectedIcdItem, setSelectedIcdItem] = useState(null);
  const [conditionStatus, setConditionStatus] = useState(null);

  // State Keluhan & Resep Obat
  const [complaintText, setComplaintText] = useState('');
  const [selectedDrug, setSelectedDrug] = useState(KFA_DRUGS[0].code);
  const [dosageText, setDosageText] = useState('3 kali sehari 1 tablet sesudah makan');
  const [quantity, setQuantity] = useState(10);
  const [observationStatus, setObservationStatus] = useState(null);
  const [medicationStatus, setMedicationStatus] = useState(null);

  if (!encounter) {
    return (
      <div className="card-bright" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#e0f2fe',
          color: '#0284c7',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          margin: '0 auto 16px auto'
        }}>
          <i className="fas fa-notes-medical" />
        </div>
        <h4 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '16px' }}>Rekam Medis Elektronik (RME)</h4>
        <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '320px', margin: '0 auto' }}>
          Silakan pilih pasien di daftar antrean lalu klik tombol <b>Periksa</b>.
        </p>
      </div>
    );
  }

  // --- HANDLER KIRIM KELUHAN (OBSERVATION) --- (persis CONNECT)
  const handleSendComplaint = async () => {
    if (!complaintText.trim()) {
      alert('Tulis keluhan pasien terlebih dahulu!');
      return;
    }
    if (!encounterId) {
      alert('Encounter ID tidak ditemukan! Pastikan antrean sudah berstatus TERKONEKSI.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/rme/complaint', {
        encounterIhsId: encounterId,
        patientIhsId: patientIhs,
        patientName: patientName,
        complaintText: complaintText
      });
      setObservationStatus(`Tersimpan (ID: ${res.data.observationId})`);
      alert('Keluhan/Anamnesis berhasil tercatat ke SATUSEHAT!');
    } catch (err) {
      alert('Gagal mengirim keluhan: ' + (err.response?.data?.error?.issue?.[0]?.details?.text || err.message));
    }
  };

  // --- HANDLER KIRIM RESEP (MEDICATION REQUEST) --- (persis CONNECT)
  const handleSendPrescription = async () => {
    if (!encounterId) {
      alert('Encounter ID tidak ditemukan! Pastikan antrean sudah berstatus TERKONEKSI.');
      return;
    }

    const drug = KFA_DRUGS.find((d) => d.code === selectedDrug);

    try {
      const res = await axios.post('http://localhost:5000/api/rme/prescription', {
        encounterIhsId: encounterId,
        patientIhsId: patientIhs,
        patientName: patientName,
        kfaCode: drug.code,
        kfaDisplay: drug.name,
        dosageText: dosageText,
        quantity: quantity
      });
      setMedicationStatus(`Tersimpan (ID: ${res.data.medicationRequestId})`);
      alert('Resep obat berhasil tercatat ke SATUSEHAT!');
    } catch (err) {
      alert('Gagal mengirim resep obat: ' + (err.response?.data?.error?.issue?.[0]?.details?.text || err.message));
    }
  };

  // --- HANDLER KIRIM DIAGNOSA (CONDITION) --- (persis CONNECT, termasuk fallback route)
  const handleSendCondition = async () => {
    if (!selectedIcdItem) {
      alert('Pilih diagnosa ICD-10 terlebih dahulu!');
      return;
    }
    if (!encounterId) {
      alert('Encounter ID tidak ditemukan!');
      return;
    }

    const targetIcd = selectedIcdItem;

    try {
      const payload = {
        encounterIhsId: encounterId,
        patientIhsId: patientIhs,
        patientName: patientName,
        icd10Code: targetIcd.code,
        icd10Display: targetIcd.display,
        display: targetIcd.display
      };

      try {
        await axios.post('http://localhost:5000/api/condition', payload);
      } catch (fallbackErr) {
        if (fallbackErr.response?.status === 404) {
          await axios.post('http://localhost:5000/api/rme/condition', payload);
        } else {
          throw fallbackErr;
        }
      }

      setConditionStatus('Tersimpan di SatuSehat');
      alert('Diagnosa berhasil dikirim ke SATUSEHAT!');
    } catch (err) {
      const rawError = err.response?.data?.error;
      const errorMsg = rawError?.issue?.[0]?.details?.text
        || rawError?.message
        || (typeof rawError === 'string' ? rawError : JSON.stringify(rawError))
        || err.message;

      alert('Gagal mengirim diagnosa: ' + errorMsg);
    }
  };

  // --- HANDLER SELESAIKAN PEMERIKSAAN --- (persis CONNECT, termasuk fallback route)
  const handleCloseEncounter = async () => {
    const payload = {
      encounterId: encounter.id,
      encounterIhsId: encounterId,
      patientIhsId: patientIhs,
      patientName: patientName,
      startTime: encounter.start_time
    };

    try {
      let res;
      try {
        // Coba rute /api/encounter/finish terlebih dahulu
        res = await axios.post('http://localhost:5000/api/encounter/finish', payload);
      } catch (err1) {
        if (err1.response?.status === 404) {
          // Fallback ke /api/encounter/close
          res = await axios.post('http://localhost:5000/api/encounter/close', payload);
        } else {
          throw err1;
        }
      }

      alert('Pemeriksaan berhasil diselesaikan!');
      onFinished();
    } catch (err) {
      const rawError = err.response?.data?.error;
      const errorMsg = typeof rawError === 'string'
        ? rawError
        : (rawError?.issue?.[0]?.details?.text || rawError?.message || err.message);
      alert('Gagal menutup encounter: ' + errorMsg);
    }
  };

  // ================== TAMPILAN GAYA UI/UX (tidak mengubah logic di atas) ==================

  const SectionTitle = ({ icon, children }) => (
    <h5 style={{ fontSize: '14px', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px' }}>
      <i className={`fas ${icon}`} style={{ marginRight: '8px' }} />
      {children}
    </h5>
  );

  return (
    <div className="card-bright" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <div className="card-title" style={{ position: 'sticky', top: '-20px', background: 'var(--bg-card)', zIndex: 10, paddingTop: '20px' }}>
        <div className="card-title-icon" style={{ background: '#dcfce7', color: '#10b981' }}>
          <i className="fas fa-file-medical" />
        </div>
        <div>
          <span>Rekam Medis Elektronik (RME)</span>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
            Encounter SatuSehat ID: {encounterId || 'Belum Ada ID'}
          </span>
        </div>
      </div>

      {/* Patient Detail Box */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
          <i className="fas fa-user-injured" style={{ color: '#0284c7', marginRight: '6px' }} />
          {patientName} <span style={{ fontWeight: '500', color: '#64748b', fontSize: '12px' }}>(IHS: {patientIhs || '-'})</span>
        </div>
      </div>

      {/* 1. KELUHAN & ANAMNESIS (Observation) */}
      <div style={{ marginBottom: '24px' }}>
        <SectionTitle icon="fa-comments-medical">Keluhan Pasien / Anamnesis</SectionTitle>
        <textarea
          rows={2}
          className="input-bright"
          placeholder="Contoh: Pasien pusing berputar sejak 2 hari lalu..."
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
        />
        <button onClick={handleSendComplaint} className="btn btn-primary" style={{ marginTop: '10px' }}>
          <i className="fas fa-paper-plane" />
          Kirim Keluhan (Observation)
        </button>
        {observationStatus && (
          <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '13px', fontWeight: '600' }}>
            <i className="fas fa-check-circle" /> {observationStatus}
          </div>
        )}
      </div>

      {/* 2. DIAGNOSA ICD-10 (Condition) */}
      <div style={{ marginBottom: '24px' }}>
        <SectionTitle icon="fa-clipboard-check">Diagnosa Primer (ICD-10)</SectionTitle>
        <div style={{ marginBottom: '10px' }}>
          <Icd10Search
            value={selectedIcdItem?.code}
            onSelect={(item) => setSelectedIcdItem(item)}
          />
        </div>
        {selectedIcdItem && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px',
            fontSize: '13px', marginBottom: '10px'
          }}>
            <span style={{ background: '#15803d', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontWeight: '700' }}>
              {selectedIcdItem.code}
            </span>
            {selectedIcdItem.display}
          </div>
        )}
        <button onClick={handleSendCondition} className="btn btn-primary">
          <i className="fas fa-paper-plane" />
          Kirim Diagnosa (Condition)
        </button>
        {conditionStatus && (
          <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '13px', fontWeight: '600' }}>
            <i className="fas fa-check-circle" /> {conditionStatus}
          </div>
        )}
      </div>

      {/* 3. RESEP OBAT (KFA / MedicationRequest) */}
      <div style={{ marginBottom: '24px' }}>
        <SectionTitle icon="fa-prescription">Resep Obat (KFA Kemenkes)</SectionTitle>
        <select
          value={selectedDrug}
          onChange={(e) => setSelectedDrug(e.target.value)}
          className="input-bright"
          style={{ marginBottom: '10px', cursor: 'pointer' }}
        >
          {KFA_DRUGS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name} (KFA: {d.code})
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Aturan Pakai"
            value={dosageText}
            onChange={(e) => setDosageText(e.target.value)}
            className="input-bright"
            style={{ flex: 2 }}
          />
          <input
            type="number"
            placeholder="Jumlah"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input-bright"
            style={{ flex: 1 }}
          />
        </div>

        <button onClick={handleSendPrescription} className="btn" style={{ background: '#0d9488', color: '#fff' }}>
          <i className="fas fa-paper-plane" />
          Kirim Resep (MedicationRequest)
        </button>
        {medicationStatus && (
          <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '13px', fontWeight: '600' }}>
            <i className="fas fa-check-circle" /> {medicationStatus}
          </div>
        )}
      </div>

      {/* 4. SELESAIKAN PEMERIKSAAN */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '2px solid #f1f5f9', position: 'sticky', bottom: '-20px', background: 'var(--bg-card)', zIndex: 10, paddingBottom: '20px' }}>
        <button
          onClick={handleCloseEncounter}
          className="btn btn-danger"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          <i className="fas fa-check-double" />
          Selesaikan Pemeriksaan (Close Encounter)
        </button>
      </div>
    </div>
  );
}
