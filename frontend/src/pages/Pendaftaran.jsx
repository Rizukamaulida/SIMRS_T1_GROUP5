import React, { useState } from 'react';
import api from '../services/api';

export default function Pendaftaran({ onRegistered }) {
  const [nik, setNik] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookup = async () => {
    if (nik.length !== 16) {
      alert('NIK harus terdiri dari 16 digit angka.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/patients/lookup', { nik });
      setResult(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Pasien gagal ditemukan di SATUSEHAT.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEncounter = async () => {
    if (!result) return;
    try {
      await api.post('/encounters', { patient_id: result.id });
      alert('Berhasil mendaftarkan antrean poli & generate Encounter SATUSEHAT!');
      setResult(null);
      setNik('');
      if (onRegistered) onRegistered();
    } catch (err) {
      alert('Gagal membuat kunjungan: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="card-bright" style={{ marginBottom: '24px' }}>
      <div className="card-title">
        <div className="card-title-icon">
          <i className="fas fa-id-card" />
        </div>
        <div>
          <span>1. Pendaftaran Pasien Rawat Jalan</span>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
            Lookup Pasien via SATUSEHAT NIK Kemenkes
          </span>
        </div>
      </div>

      <div className="pendaftaran-form-group">
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="fas fa-user-check" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
          <input
            type="text"
            placeholder="Masukkan 16 Digit NIK Pasien (contoh: 3171...)"
            value={nik}
            onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
            maxLength={16}
            className="input-bright"
            style={{ paddingLeft: '38px', letterSpacing: '0.5px' }}
          />
        </div>
        <button
          onClick={handleLookup}
          disabled={loading || nik.length !== 16}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin" />
              Mengecek...
            </>
          ) : (
            <>
              <i className="fas fa-search" />
              Cari NIK
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div style={{
          background: '#ffe4e6',
          color: '#be123c',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '14px',
          border: '1px solid #fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-exclamation-circle" />
          {errorMsg}
        </div>
      )}

      {result && (
        <div style={{
          background: '#f0f9ff',
          padding: '16px',
          borderRadius: '12px',
          border: '1.5px solid #bae6fd',
          marginTop: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              {result.name ? result.name.charAt(0) : 'P'}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{result.name}</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Tgl Lahir: <strong>{result.birth_date || '-'}</strong> | Gender: <strong>{result.gender || '-'}</strong>
              </p>
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '14px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: '#64748b', fontWeight: '600' }}>SATUSEHAT IHS ID:</span>
            <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
              {result.satusehat_ihs_id || 'Generating...'}
            </code>
          </div>

          <button
            onClick={handleCreateEncounter}
            className="btn btn-success"
            style={{ width: '100%' }}
          >
            <i className="fas fa-user-plus" />
            + Masukkan ke Antrean Poli & Buat Encounter
          </button>
        </div>
      )}
    </div>
  );
}