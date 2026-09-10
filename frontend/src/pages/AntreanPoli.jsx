import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SyncBadge from '../components/SyncBadge';


export default function AntreanPoli({ onSelectEncounter, selectedEncounter, refreshKey }) {
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/encounters');
      setEncounters(res.data);
    } catch (err) {
      console.error('Gagal mengambil data antrean:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  return (
    <div className="card-bright" style={{ height: '100%' }}>
      <div className="card-title">
        <div className="card-title-icon">
          <i className="fas fa-list-ol" />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span>Antrean Poli & Status Encounter</span>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
              Daftar Kunjungan Pasien Hari Ini
            </span>
          </div>
          <span style={{
            background: '#e0f2fe',
            color: '#0284c7',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            {encounters.length} Pasien
          </span>
        </div>
      </div>

      <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
        <table className="table-bright">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Pasien & NIK</th>
              <th style={{ whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ whiteSpace: 'nowrap' }}>SATUSEHAT</th>
              <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && encounters.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />
                  Memuat data antrean poli...
                </td>
              </tr>
            ) : encounters.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  <i className="fas fa-user-clock" style={{ fontSize: '32px', marginBottom: '8px', color: '#cbd5e1', display: 'block' }} />
                  Belum ada antrean kunjungan pasien.
                </td>
              </tr>
            ) : (
              encounters.map((enc) => {
                const isSelected = selectedEncounter && selectedEncounter.id === enc.id;
                return (
                  <tr key={enc.id} className={isSelected ? 'active-row' : ''}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{enc.patient_name || 'Pasien Rawat Jalan'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>NIK: {enc.nik}</div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: enc.status === 'finished' ? '#e2e8f0' : '#dbeafe',
                        color: enc.status === 'finished' ? '#475569' : '#1d4ed8'
                      }}>
                        {enc.status}
                      </span>
                    </td>
                    <td>
                      <SyncBadge status={enc.sync_status} ihsId={enc.satusehat_encounter_id} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {enc.status !== 'finished' ? (
                        <button
                          onClick={() => onSelectEncounter(enc)}
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-primary'}`}
                          style={{
                            padding: '5px 12px',
                            fontSize: '12px',
                            background: isSelected ? '#0369a1' : undefined
                          }}
                        >
                          <i className="fas fa-user-md" style={{ marginRight: '6px' }} />
                          {isSelected ? 'Sedang Diperiksa' : 'Periksa'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                          <i className="fas fa-check-double" style={{ color: '#10b981', marginRight: '4px' }} />
                          Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}