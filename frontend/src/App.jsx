import React, { useState, useEffect } from 'react';
import Pendaftaran from './pages/Pendaftaran';
import AntreanPoli from './pages/AntreanPoli';
import PemeriksaanDokter from './pages/PemeriksaanDokter';
import api from './services/api';
import axios from 'axios';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [serverHealth, setServerHealth] = useState('CHECKING');

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    // Check backend health status on mount
    axios.get('http://localhost:5000/health')
      .then(() => setServerHealth('ONLINE'))
      .catch(() => {
        api.get('/health')
          .then(() => setServerHealth('ONLINE'))
          .catch(() => setServerHealth('OFFLINE'));
      });
  }, [refreshKey]);

  return (
    <div className="app-container">
      {/* App Glassmorphic Banner Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="app-header-badge">
              <i className="fas fa-shield-halved" />
              Standardized Kemenkes RI FHIR R4
            </div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              SIMRS Mini — Integrasi SATUSEHAT
            </h1>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '13px' }}>
              Sistem Informasi Manajemen Rumah Sakit & Rekam Medis Elektronik (RME)
            </p>
          </div>

          {/* Server Connection Badge */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: serverHealth === 'ONLINE' ? '#4ade80' : '#f87171',
              boxShadow: serverHealth === 'ONLINE' ? '0 0 10px #4ade80' : 'none'
            }} />
            <div style={{ fontSize: '12px' }}>
              <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', opacity: 0.8 }}>
                Backend Status
              </div>
              <div style={{ fontWeight: '700' }}>
                {serverHealth === 'ONLINE' ? 'http://localhost:5000 (Connected)' : 'Server Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="app-main-grid">
        {/* Left Column: Pendaftaran & Antrean Poli */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Pendaftaran onRegistered={triggerRefresh} />
          <AntreanPoli
            refreshKey={refreshKey}
            selectedEncounter={activeEncounter}
            onSelectEncounter={(enc) => setActiveEncounter(enc)}
          />
        </div>

        {/* Right Column: Rekam Medis Elektronik (RME) */}
        <div>
          <PemeriksaanDokter
            encounter={activeEncounter}
            onFinished={() => {
              setActiveEncounter(null);
              triggerRefresh();
            }}
          />
        </div>
      </main>
    </div>
  );
}