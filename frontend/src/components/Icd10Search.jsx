import React, { useState, useEffect } from 'react';

export default function Icd10Search({ onSelect, value }) {
  const [icd10List, setIcd10List] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/icd10.json')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat /icd10.json');
        return res.json();
      })
      .then((data) => setIcd10List(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Gagal memuat daftar ICD-10:', err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const term = searchTerm.trim().toLowerCase();
  const filtered = term
    ? icd10List.filter(
        (item) =>
          item.code.toLowerCase().includes(term) ||
          item.display.toLowerCase().includes(term)
      ).slice(0, 50)
    : icd10List.slice(0, 50);

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <i
          className="fas fa-search"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }}
        />
        <input
          type="text"
          placeholder={loading ? 'Memuat daftar ICD-10...' : `Cari dari ${icd10List.length} kode ICD-10 (kode atau nama penyakit)...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-bright"
          style={{ paddingLeft: '34px' }}
          disabled={loading || loadError}
        />
      </div>

      {loadError && (
        <div style={{ color: '#be123c', fontSize: '12px', marginBottom: '8px' }}>
          <i className="fas fa-exclamation-circle" /> Gagal memuat daftar ICD-10 dari /icd10.json.
        </div>
      )}

      <select
        value={value || ''}
        onChange={(e) => {
          const item = icd10List.find((x) => x.code === e.target.value);
          if (item) onSelect(item);
        }}
        className="input-bright"
        style={{ cursor: 'pointer', fontWeight: '500' }}
        disabled={loading || loadError}
        size={term ? Math.min(Math.max(filtered.length, 1), 8) : undefined}
      >
        <option value="" disabled>
          {loading ? 'Memuat...' : '-- Pilih Diagnosa ICD-10 --'}
        </option>
        {filtered.map((d) => (
          <option key={d.code} value={d.code}>
            {d.code} — {d.display}
          </option>
        ))}
      </select>

      {term && filtered.length === 0 && !loading && (
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Tidak ada kode ICD-10 yang cocok.</div>
      )}
    </div>
  );
}
