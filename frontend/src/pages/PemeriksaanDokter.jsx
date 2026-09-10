import React, { useState } from 'react';
import api from '../services/api';
import Icd10Search from '../components/Icd10Search';

export default function PemeriksaanDokter({ encounter, onFinished }) {
  // State: Anamnesis
  const [keluhanUtama, setKeluhanUtama] = useState('');
  const [keluhanPenyerta, setKeluhanPenyerta] = useState('');
  const [riwayatAlergi, setRiwayatAlergi] = useState('');
  const [riwayatPenyakitPribadi, setRiwayatPenyakitPribadi] = useState('');
  const [riwayatPenyakitKeluarga, setRiwayatPenyakitKeluarga] = useState('');
  const [riwayatPengobatan, setRiwayatPengobatan] = useState('');

  // State: Pemeriksaan Fisik & Psikologis
  const [pemeriksaanFisik, setPemeriksaanFisik] = useState('');

  // State: Diagnosa Tersimpan Sementara (Buffer)
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  
  // State: Catatan Dokter (Tindakan & Resep)
  const [isPermintaanTindakan, setIsPermintaanTindakan] = useState(false);
  const [permintaanTindakan, setPermintaanTindakan] = useState('');
  const [isResepObat, setIsResepObat] = useState(false);
  const [resepObat, setResepObat] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

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
          margin: '0 auto 16px auto'
        }}>
          <i className="fas fa-notes-medical" />
        </div>
        <h4 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '16px' }}>Rekam Medis Elektronik (RME)</h4>
        <p style={{ fontSize: '13px', margin: 0, color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>
          Silakan pilih satu pasien di tabel antrean untuk mulai memeriksa & menginput data rekam medis.
        </p>
      </div>
    );
  }

  const handleAddDiagnosisToBuffer = (icd) => {
    // Hindari duplikasi
    if (selectedDiagnoses.find(d => d.code === icd.code)) {
      alert('Diagnosis ini sudah dipesan pada sesi ini.');
      return;
    }
    setSelectedDiagnoses(prev => [...prev, icd]);
  };

  const handleRemoveDiagnosis = (code) => {
    setSelectedDiagnoses(prev => prev.filter(d => d.code !== code));
  };

  const handleFinishAndSaveAll = async () => {
    // Validasi
    if (!keluhanUtama.trim()) {
      alert('Keluhan Utama wajib diisi!');
      return;
    }
    if (!pemeriksaanFisik.trim()) {
      alert('Hasil Pemeriksaan Fisik wajib diisi!');
      return;
    }
    if (selectedDiagnoses.length === 0) {
      alert('Minimal harus memilih 1 Diagnosis ICD-10!');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin data pemeriksaan pasien ${encounter.patient_name} sudah lengkap dan valid?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Simpan Rekam Medis (Anamnesis, Fisik, Catatan)
      await api.post('/medical-records', {
        encounter_id: encounter.id,
        anamnesis_keluhan_utama: keluhanUtama,
        anamnesis_keluhan_penyerta: keluhanPenyerta,
        anamnesis_alergi: riwayatAlergi,
        anamnesis_riwayat_pribadi: riwayatPenyakitPribadi,
        anamnesis_riwayat_keluarga: riwayatPenyakitKeluarga,
        anamnesis_riwayat_pengobatan: riwayatPengobatan,
        pemeriksaan_fisik_psikologis: pemeriksaanFisik,
        catatan_permintaan_tindakan: isPermintaanTindakan ? permintaanTindakan : '',
        catatan_resep_obat: isResepObat ? resepObat : ''
      });

      // 2. Kirim Setiap Diagnosa ke SATUSEHAT (Lokal Condition)
      for (const diag of selectedDiagnoses) {
        await api.post('/conditions', {
          encounter_id: encounter.id,
          icd10_code: diag.code,
          icd10_display: diag.display
        });
      }

      // 3. Close Encounter
      await api.put(`/encounters/${encounter.id}/finish`);

      alert('Seluruh rekam medis berhasil disimpan & kunjungan selesai ditutup (Sync SATUSEHAT).');
      
      // Bersihkan form
      setKeluhanUtama('');
      setKeluhanPenyerta('');
      setRiwayatAlergi('');
      setRiwayatPenyakitPribadi('');
      setRiwayatPenyakitKeluarga('');
      setRiwayatPengobatan('');
      setPemeriksaanFisik('');
      setSelectedDiagnoses([]);
      setIsPermintaanTindakan(false);
      setPermintaanTindakan('');
      setIsResepObat(false);
      setResepObat('');
      
      onFinished();
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan data: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const Label = ({ children, required }) => (
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
      {children}
      {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
    </label>
  );

  return (
    <div className="card-bright" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <div className="card-title" style={{ position: 'sticky', top: '-20px', background: 'var(--bg-card)', zIndex: 10, paddingTop: '20px' }}>
        <div className="card-title-icon" style={{ background: '#dcfce7', color: '#10b981' }}>
          <i className="fas fa-file-medical" />
        </div>
        <div>
          <span>3. Rekam Medis Elektronik (RME)</span>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
            Lengkapi data sebelum menyelesaikan pemeriksaan
          </span>
        </div>
      </div>

      {/* Patient Detail Box */}
      <div style={{
        background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
            <i className="fas fa-user-injured" style={{ color: '#0284c7', marginRight: '6px' }} />
            {encounter.patient_name}
          </div>
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
            Kunjungan #{encounter.id}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>IHS Patient ID: <strong style={{ color: '#0f172a' }}>{encounter.patient_ihs_id || 'Pending'}</strong></div>
        </div>
      </div>

      {/* Block 1: Anamnesis */}
      <div style={{ marginBottom: '24px' }}>
        <h5 style={{ fontSize: '14px', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px' }}>
          <i className="fas fa-comments-medical" style={{ marginRight: '8px' }} />
          Formulir Anamnesis
        </h5>
        
        <div style={{ marginBottom: '12px' }}>
          <Label required>Keluhan Utama</Label>
          <textarea className="input-bright" rows={2} value={keluhanUtama} onChange={e => setKeluhanUtama(e.target.value)} placeholder="Tuliskan keluhan utama pasien..." />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <Label>Keluhan Penyerta</Label>
          <textarea className="input-bright" rows={2} value={keluhanPenyerta} onChange={e => setKeluhanPenyerta(e.target.value)} placeholder="Tuliskan keluhan penyerta jika ada..." />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <Label>Riwayat Alergi</Label>
            <textarea className="input-bright" rows={2} value={riwayatAlergi} onChange={e => setRiwayatAlergi(e.target.value)} placeholder="Alergi obat / makanan..." />
          </div>
          <div>
            <Label>Riwayat Pengobatan</Label>
            <textarea className="input-bright" rows={2} value={riwayatPengobatan} onChange={e => setRiwayatPengobatan(e.target.value)} placeholder="Obat yang sedang dikonsumsi..." />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <Label>Riwayat Penyakit Pribadi</Label>
            <textarea className="input-bright" rows={2} value={riwayatPenyakitPribadi} onChange={e => setRiwayatPenyakitPribadi(e.target.value)} placeholder="Penyakit terdahulu..." />
          </div>
          <div>
            <Label>Riwayat Penyakit Keluarga</Label>
            <textarea className="input-bright" rows={2} value={riwayatPenyakitKeluarga} onChange={e => setRiwayatPenyakitKeluarga(e.target.value)} placeholder="Mis. Hipertensi, DM dari pihak ayah/ibu..." />
          </div>
        </div>
      </div>

      {/* Block 2: Pemeriksaan Fisik */}
      <div style={{ marginBottom: '24px' }}>
        <h5 style={{ fontSize: '14px', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px' }}>
          <i className="fas fa-stethoscope" style={{ marginRight: '8px' }} />
          Pemeriksaan Fisik & Psikologis
        </h5>
        <div>
          <Label required>Hasil Pemeriksaan Fisik / Objektif / Psikologis</Label>
          <textarea className="input-bright" rows={4} value={pemeriksaanFisik} onChange={e => setPemeriksaanFisik(e.target.value)} placeholder="Tuliskan TTV, kesadaran, serta hasil pemeriksaan bagian tubuh..." />
        </div>
      </div>

      {/* Block 3: Diagnosis (ICD-10) */}
      <div style={{ marginBottom: '24px' }}>
        <h5 style={{ fontSize: '14px', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px' }}>
          <i className="fas fa-clipboard-check" style={{ marginRight: '8px' }} />
          Diagnosis Dokter (ICD-10)
        </h5>
        
        {/* ICD Targeter/Buffer */}
        <div style={{ marginBottom: '12px' }}>
          <Icd10Search onSelect={(item) => handleAddDiagnosisToBuffer(item)} />
        </div>

        {selectedDiagnoses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Label required>Diagnosis Terpilih (akan dikirim ke SATUSEHAT)</Label>
            {selectedDiagnoses.map((d, index) => (
              <div key={index} style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px',
                fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ background: '#15803d', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontWeight: '700' }}>
                    {d.code}
                  </span>
                  {d.display}
                </div>
                <button onClick={() => handleRemoveDiagnosis(d.code)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <i className="fas fa-times-circle" />
                </button>
              </div>
            ))}
          </div>
        ) : (
           <div style={{ fontSize: '12px', color: '#ef4444', fontStyle: 'italic' }}>* Anda belum menambahkan diagnosis. Silakan cari dan pilih dari form ICD-10 di atas.</div>
        )}
      </div>

      {/* Block 4: Catatan Dokter (Tindakan & Resep) */}
      <div style={{ marginBottom: '24px' }}>
        <h5 style={{ fontSize: '14px', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px' }}>
          <i className="fas fa-prescription" style={{ marginRight: '8px' }} />
          Catatan Dokter: Tindakan & Resep
        </h5>
        
        {/* Tindakan Toggle */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#334155' }}>
            <input 
              type="checkbox" 
              checked={isPermintaanTindakan} 
              onChange={e => setIsPermintaanTindakan(e.target.checked)} 
              style={{ width: '16px', height: '16px' }}
            />
            Memerlukan Permintaan Tindakan (Lab, Radiologi, Bedah, dll)
          </label>
          
          {isPermintaanTindakan && (
            <div style={{ marginTop: '10px', marginLeft: '24px', paddingLeft: '12px', borderLeft: '2px solid #e2e8f0' }}>
               <textarea className="input-bright" rows={2} value={permintaanTindakan} onChange={e => setPermintaanTindakan(e.target.value)} placeholder="Tuliskan jenis/rincian tindakan yang diminta..." />
            </div>
          )}
        </div>

        {/* Resep Toggle */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#334155' }}>
            <input 
              type="checkbox" 
              checked={isResepObat} 
              onChange={e => setIsResepObat(e.target.checked)} 
              style={{ width: '16px', height: '16px' }}
            />
            Memerlukan Resep Obat (Farmasi)
          </label>
          
          {isResepObat && (
            <div style={{ marginTop: '10px', marginLeft: '24px', paddingLeft: '12px', borderLeft: '2px solid #e2e8f0' }}>
               <textarea className="input-bright" rows={3} value={resepObat} onChange={e => setResepObat(e.target.value)} placeholder="R/ Para 500mg No. X\nS 3 dd 1 p.c\n\nTuliskan resep obat secara berurutan..." />
            </div>
          )}
        </div>
      </div>

      {/* Action Button: The BIG GREEN FINISH BUTTON */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '2px solid #f1f5f9', position: 'sticky', bottom: '-20px', background: 'var(--bg-card)', zIndex: 10, paddingBottom: '20px' }}>
        <button
          onClick={handleFinishAndSaveAll}
          disabled={isSubmitting}
          className="btn btn-success"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin" />
              Menyimpan & Menyelesaikan Kunjungan...
            </>
          ) : (
            <>
              <i className="fas fa-check-double" />
              Simpan Data & Selesaikan Pemeriksaan
            </>
          )}
        </button>
      </div>
    </div>
  );
}