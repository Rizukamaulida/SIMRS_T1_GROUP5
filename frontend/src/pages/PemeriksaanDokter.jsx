import React, { useState } from 'react';
import api from '../services/api';
import Icd10Search from '../components/Icd10Search';

export default function PemeriksaanDokter({ encounter, onFinished }) {
  const [selectedIcd, setSelectedIcd] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addedDiagnoses, setAddedDiagnoses] = useState([]);

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
          marginBottom: '16px'
        }}>
          <i className="fas fa-notes-medical" />
        </div>
        <h4 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '16px' }}>Rekam Medis Elektronik (RME)</h4>
        <p style={{ fontSize: '13px', margin: 0, color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>
          Silakan pilih salah satu pasien di tabel antrean untuk mulai memeriksa & menginput data rekam medis SATUSEHAT.
        </p>
      </div>
    );
  }

  const handleAddDiagnosis = async () => {
    if (!selectedIcd) {
      alert('Pilih diagnosa ICD-10 terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/conditions', {
        encounter_id: encounter.id,
        icd10_code: selectedIcd.code,
        icd10_display: selectedIcd.display
      });
      alert(`Diagnosa ${selectedIcd.code} (${selectedIcd.display}) berhasil terkirim ke SATUSEHAT Condition!`);
      setAddedDiagnoses((prev) => [...prev, selectedIcd]);
      setSelectedIcd(null);
    } catch (err) {
      alert('Gagal mengirim diagnosa: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishEncounter = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menyelesaikan pemeriksaan untuk pasien ${encounter.patient_name}?`)) return;
    try {
      await api.put(`/encounters/${encounter.id}/finish`);
      alert('Kunjungan pasien berhasil ditutup. Status Encounter di SATUSEHAT kini FINISHED.');
      setAddedDiagnoses([]);
      onFinished();
    } catch (err) {
      alert('Gagal menutup encounter: ' + err.message);
    }
  };

  return (
    <div className="card-bright">
      <div className="card-title">
        <div className="card-title-icon" style={{ background: '#dcfce7', color: '#10b981' }}>
          <i className="fas fa-file-medical" />
        </div>
        <div>
          <span>3. Rekam Medis Elektronik (RME)</span>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
            Input Diagnosa & Sinkronisasi SATUSEHAT FHIR R4
          </span>
        </div>
      </div>

      {/* Patient Detail Box */}
      <div style={{
        background: '#f8fafc',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
            <i className="fas fa-user-injured" style={{ color: '#0284c7', marginRight: '6px' }} />
            {encounter.patient_name}
          </div>
          <span style={{
            background: '#e0f2fe',
            color: '#0369a1',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            Kunjungan #{encounter.id}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>IHS Patient ID: <strong style={{ color: '#0f172a' }}>{encounter.patient_ihs_id || 'Pending'}</strong></div>
          <div>
            Encounter ID SATUSEHAT:{' '}
            {encounter.satusehat_encounter_id ? (
              <code style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                {encounter.satusehat_encounter_id}
              </code>
            ) : (
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>Pending / Sinkronisasi lokal</span>
            )}
          </div>
        </div>
      </div>

      {/* ICD-10 Search Component */}
      <Icd10Search onSelect={(item) => setSelectedIcd(item)} />

      {/* Selected Diagnosis Confirmation Card */}
      {selectedIcd && (
        <div style={{
          marginTop: '16px',
          padding: '14px',
          background: '#f0f9ff',
          borderRadius: '10px',
          border: '1.5px solid #38bdf8'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1', marginBottom: '4px' }}>
            DIAGNOSA TERPILIH:
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
            <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', marginRight: '8px' }}>
              {selectedIcd.code}
            </span>
            {selectedIcd.display}
          </div>
          <button
            onClick={handleAddDiagnosis}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin" />
                Mengirim ke SATUSEHAT Condition...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane" />
                Kirim Diagnosa ke SATUSEHAT
              </>
            )}
          </button>
        </div>
      )}

      {/* List of Added Diagnoses in current session */}
      {addedDiagnoses.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
            Diagnosa Terkirim (Session Ini):
          </div>
          {addedDiagnoses.map((d, index) => (
            <div key={index} style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span><strong>{d.code}</strong> - {d.display}</span>
              <i className="fas fa-check-circle" style={{ color: '#10b981' }} />
            </div>
          ))}
        </div>
      )}

      {/* Close Encounter Action */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px solid #f1f5f9' }}>
        <button
          onClick={handleFinishEncounter}
          className="btn btn-danger"
          style={{ width: '100%' }}
        >
          <i className="fas fa-lock" />
          Selesaikan Pemeriksaan & Close Encounter
        </button>
      </div>
    </div>
  );
}