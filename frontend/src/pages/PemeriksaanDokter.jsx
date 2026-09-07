import React, { useState } from 'react';
import api from '../services/api';
import Icd10Search from '../components/Icd10Search';

export default function PemeriksaanDokter({ encounter, onFinished }) {
  const [selectedIcd, setSelectedIcd] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!encounter) {
    return (
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, textAlign: 'center', color: '#64748b' }}>
        Pilih salah satu pasien di antrean untuk mulai menginput data rekam medis.
      </div>
    );
  }

  const handleAddDiagnosis = async () => {
    if (!selectedIcd) {
      alert('Pilih diagnosa ICD-10 terlebih dahulu');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/conditions', {
        encounter_id: encounter.id,
        icd10_code: selectedIcd.code,
        icd10_display: selectedIcd.display
      });
      alert(`Diagnosa ${selectedIcd.code} berhasil dikirim ke SatuSehat Condition!`);
    } catch (err) {
      alert('Gagal mengirim diagnosa: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishEncounter = async () => {
    if (!window.confirm('Selesaikan sesi pemeriksaan pasien ini?')) return;
    try {
      await api.put(`/encounters/${encounter.id}/finish`);
      alert('Kunjungan ditutup. Status Encounter di SatuSehat diubah menjadi Finished.');
      onFinished();
    } catch (err) {
      alert('Gagal menutup encounter: ' + err.message);
    }
  };

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>3. Rekam Medis Elektronik (RME)</h3>
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 10, marginBottom: 12 }}>
        <p style={{ margin: '2px 0' }}><strong>Pasien:</strong> {encounter.patient_name} (IHS: {encounter.patient_ihs_id})</p>
        <p style={{ margin: '2px 0' }}><strong>Encounter SatuSehat ID:</strong> {encounter.satusehat_encounter_id || 'Pending / Belum Tersinkron'}</p>
      </div>

      <Icd10Search onSelect={(item) => setSelectedIcd(item)} />

      {selectedIcd && (
        <div style={{ marginTop: 12, padding: 8, background: '#f8fafc', borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 13 }}>Terpilih: <strong>{selectedIcd.code}</strong> - {selectedIcd.display}</p>
          <button
            onClick={handleAddDiagnosis}
            disabled={isSubmitting}
            style={{ marginTop: 8, background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
          >
            {isSubmitting ? 'Mengirim ke SatuSehat...' : 'Kirim Diagnosa (Condition)'}
          </button>
        </div>
      )}

      <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
        <button
          onClick={handleFinishEncounter}
          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
        >
          Selesaikan Pemeriksaan (Close Encounter)
        </button>
      </div>
    </div>
  );
}