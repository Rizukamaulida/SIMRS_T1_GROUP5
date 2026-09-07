import React, { useState } from 'react';
import api from '../services/api';

export default function Pendaftaran({ onRegistered }) {
  const [nik, setNik] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async () => {
    if (nik.length !== 16) {
      alert('NIK harus 16 digit');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/patients/lookup', { nik });
      setResult(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Pasien gagal ditemukan.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEncounter = async () => {
    if (!result) return;
    try {
      await api.post('/encounters', { patient_id: result.id });
      alert('Berhasil mendaftarkan antrean poli & generate Encounter SatuSehat!');
      setResult(null);
      setNik('');
      if (onRegistered) onRegistered();
    } catch (err) {
      alert('Gagal membuat kunjungan: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 12px 0' }}>1. Pendaftaran Pasien Rawat Jalan (Lookup SatuSehat)</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Masukkan 16 Digit NIK Pasien"
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          maxLength={16}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          {loading ? 'Mengecek ke SATUSEHAT...' : 'Cari NIK'}
        </button>
      </div>

      {errorMsg && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>{errorMsg}</div>}

      {result && (
        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '4px 0' }}><strong>Nama:</strong> {result.name}</p>
          <p style={{ margin: '4px 0' }}><strong>Tgl Lahir / Gender:</strong> {result.birth_date} / {result.gender}</p>
          <p style={{ margin: '4px 0' }}><strong>SatuSehat IHS ID:</strong> <code>{result.satusehat_ihs_id}</code></p>
          <button
            onClick={handleCreateEncounter}
            style={{ marginTop: 10, background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
          >
            + Masukkan ke Antrean Poli & Buat Encounter
          </button>
        </div>
      )}
    </div>
  );
}