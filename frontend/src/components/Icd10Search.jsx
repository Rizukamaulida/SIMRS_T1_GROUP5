<<<<<<< HEAD
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
=======
import React, { useState, useRef, useEffect } from 'react';

export default function Icd10Search({ onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [icdData, setIcdData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    fetch('/icd10.json')
      .then(res => res.json())
      .then(data => {
        setIcdData(data.filter(d => Boolean(d.CODE))); // pastikan valid
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load icd10.json', err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    // Menutup dropdown saat klik di luar area
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Efficient filter for 90000+ rows
  const getFilteredDiagnoses = () => {
    if (!searchTerm) return [];
    const lowerTerm = searchTerm.toLowerCase();
    const results = [];
    for (let i = 0; i < icdData.length; i++) {
       const item = icdData[i];
       if (
         (item.CODE && item.CODE.toLowerCase().includes(lowerTerm)) ||
         (item.DISPLAY && item.DISPLAY.toLowerCase().includes(lowerTerm))
       ) {
          results.push(item);
          // Batasi 50 hasil untuk performa render (DOM tidak hang)
          if (results.length >= 50) break;
       }
    }
    return results;
  };

  const filteredDiagnoses = getFilteredDiagnoses();

  const handleSelect = (item) => {
    setSearchTerm('');
    setIsOpen(false);
    // Standarisasi key ke format huruf kecil agar kompatibel dengan PemeriksaanDokter.jsx
    onSelect({
       code: item.CODE,
       display: item.DISPLAY
    });
  };

  return (
    <div style={{ marginTop: '14px' }} ref={wrapperRef}>
      <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
        <i className="fas fa-stethoscope" style={{ color: '#0284c7', marginRight: '6px' }} />
        Pilih Diagnosa Primer (ICD-10):
      </label>

      {/* Filter Input & Dropdown */}
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
        <input
          type="text"
          placeholder={isLoading ? "Memuat 90rb+ daftar ICD-10..." : "Ketik setidaknya 2 huruf/angka untuk mencari (Cth: demam)..."}
          value={searchTerm}
          disabled={isLoading}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="input-bright"
          style={{ paddingLeft: '34px', width: '100%', boxSizing: 'border-box' }}
        />
        
        {isOpen && searchTerm.length >= 2 && !isLoading && (
            <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: '250px',
                overflowY: 'auto',
                backgroundColor: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                marginTop: '4px',
                zIndex: 10,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                {filteredDiagnoses.length > 0 ? (
                    <>
                        {filteredDiagnoses.map((d) => (
                            <div
                                key={d.CODE}
                                onClick={() => handleSelect(d)}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#334155',
                                    borderBottom: '1px solid #f1f5f9'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                <strong>{d.CODE}</strong> — {d.DISPLAY}
                            </div>
                        ))}
                        {filteredDiagnoses.length === 50 && (
                             <div style={{ padding: '8px 12px', fontSize: '12px', color: '#94a3b8', textAlign: 'center', backgroundColor: '#f1f5f9' }}>
                                 Menampilkan 50 hasil teratas, perinci pencarian Anda...
                             </div>
                        )}
                    </>
                ) : (
                    <div style={{ padding: '8px 12px', fontSize: '14px', color: '#64748b' }}>
                        Tidak ada hasil yang ditemukan
                    </div>
                )}
            </div>
        )}
      </div>
>>>>>>> e41d4bdb8d134e2706a0a35ff157eaea5854b734
    </div>
  );
}
