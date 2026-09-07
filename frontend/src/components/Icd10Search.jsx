import React, { useState } from 'react';

// Master ICD-10 primer umum dengan kategori & deskripsi lengkap
const COMMON_ICD10 = [
  { code: 'R50.9', display: 'Fever, unspecified (Demam)', tag: 'Demam' },
  { code: 'K29.7', display: 'Gastritis, unspecified (Gastritis / Maag)', tag: 'Gastritis' },
  { code: 'J00', display: 'Acute nasopharyngitis [common cold] (ISPA / Batuk Pilek)', tag: 'ISPA' },
  { code: 'I10', display: 'Essential (primary) hypertension (Hipertensi)', tag: 'Hipertensi' },
  { code: 'E11.9', display: 'Type 2 diabetes mellitus without complications (Diabetes T2)', tag: 'Diabetes' },
  { code: 'A09', display: 'Infectious gastroenteritis and colitis (Diare / Gastroenteritis)', tag: 'Diare' }
];

export default function Icd10Search({ onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState('');

  const filteredDiagnoses = COMMON_ICD10.filter((item) =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.display.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChipClick = (item) => {
    setSelectedCode(item.code);
    onSelect(item);
  };

  return (
    <div style={{ marginTop: '14px' }}>
      <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
        <i className="fas fa-stethoscope" style={{ color: '#0284c7', marginRight: '6px' }} />
        Pilih Diagnosa Primer (ICD-10):
      </label>

      {/* Quick Selection Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        {COMMON_ICD10.map((item) => (
          <button
            key={item.code}
            type="button"
            className={`quick-chip ${selectedCode === item.code ? 'active' : ''}`}
            onClick={() => handleChipClick(item)}
          >
            <i className="fas fa-plus-circle" style={{ fontSize: '11px' }} />
            {item.tag} ({item.code})
          </button>
        ))}
      </div>

      {/* Filter Input */}
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
        <input
          type="text"
          placeholder="Cari kode atau nama penyakit ICD-10..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-bright"
          style={{ paddingLeft: '34px' }}
        />
      </div>

      {/* Dropdown Select */}
      <select
        value={selectedCode}
        onChange={(e) => {
          const item = COMMON_ICD10.find((x) => x.code === e.target.value);
          if (item) {
            setSelectedCode(item.code);
            onSelect(item);
          }
        }}
        className="input-bright"
        style={{ cursor: 'pointer', fontWeight: '500' }}
      >
        <option value="" disabled>-- Pilih atau Cari Diagnosa ICD-10 --</option>
        {filteredDiagnoses.map((d) => (
          <option key={d.code} value={d.code}>
            {d.code} — {d.display}
          </option>
        ))}
      </select>
    </div>
  );
}