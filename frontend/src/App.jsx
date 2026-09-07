import React, { useState } from 'react';
import Pendaftaran from './pages/Pendaftaran';
import AntreanPoli from './pages/AntreanPoli';
import PemeriksaanDokter from './pages/PemeriksaanDokter';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeEncounter, setActiveEncounter] = useState(null);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f1f5f9', minHeight: '100vh', padding: '24px' }}>
      <header style={{ maxWidth: 1100, margin: '0 auto 24px auto' }}>
        <h1 style={{ margin: 0, color: '#0f172a' }}>SIMRS Mini - Integrasi SATUSEHAT FHIR R4</h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Sistem Informasi Manajemen Rumah Sakit Terstandarisasi Kemenkes RI</p>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <Pendaftaran onRegistered={triggerRefresh} />
          <AntreanPoli
            refreshKey={refreshKey}
            onSelectEncounter={(enc) => setActiveEncounter(enc)}
          />
        </div>
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