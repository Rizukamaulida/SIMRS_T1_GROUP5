import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SyncBadge from '../components/SyncBadge';

export default function AntreanPoli({ onSelectEncounter, refreshKey }) {
  const [encounters, setEncounters] = useState([]);

  const loadData = async () => {
    try {
      const res = await api.get('/encounters');
      setEncounters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 12px 0' }}>2. Antrean Poli & Status Encounter</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
            <th style={{ padding: 8 }}>ID</th>
            <th style={{ padding: 8 }}>Nama Pasien</th>
            <th style={{ padding: 8 }}>Status Kunjungan</th>
            <th style={{ padding: 8 }}>SatuSehat Status</th>
            <th style={{ padding: 8 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {encounters.length === 0 ? (
            <tr><td colSpan={5} style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>Belum ada antrean kunjungan.</td></tr>
          ) : (
            encounters.map((enc) => (
              <tr key={enc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: 8 }}>#{enc.id}</td>
                <td style={{ padding: 8 }}><strong>{enc.patient_name}</strong><br/><span style={{ fontSize: 11, color: '#64748b' }}>NIK: {enc.nik}</span></td>
                <td style={{ padding: 8 }}>
                  <span style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 600 }}>{enc.status}</span>
                </td>
                <td style={{ padding: 8 }}>
                  <SyncBadge status={enc.sync_status} ihsId={enc.satusehat_encounter_id} />
                </td>
                <td style={{ padding: 8 }}>
                  {enc.status !== 'finished' ? (
                    <button
                      onClick={() => onSelectEncounter(enc)}
                      style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    >
                      Periksa
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: '#64748b' }}>Selesai</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}