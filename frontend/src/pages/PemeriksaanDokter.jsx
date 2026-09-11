import React, { useState } from 'react';
import axios from 'axios';
import Icd10Search from '../components/Icd10Search';

<<<<<<< HEAD
// ================== LOGIC & DATA PERSIS SEPERTI SISTEM CONNECT (tidak diubah) ==================
// Catatan: master ICD-10 sekarang diambil dari frontend/public/icd10.json (2048 kode resmi),
// bukan lagi 4 kode hardcode. Lihat komponen Icd10Search.

// 1. Master KFA Kemenkes
const KFA_DRUGS = [
  { code: '93000572', name: 'Paracetamol 500 mg Tablet' },
  { code: '93000854', name: 'Amoxicillin 500 mg Kapsul' },
  { code: '93001018', name: 'Antasida Doen Tablet Kunyah' },
  { code: '93000632', name: 'Cetirizine 10 mg Tablet' }
];

export default function PemeriksaanDokter({ encounter, onFinished }) {
  // Normalisasi ID dan nama pasien
  const encounterId = encounter?.satusehat_encounter_id || encounter?.encounter_satusehat_id || encounter?.satusehat_id;
  const patientIhs = encounter?.satusehat_patient_id || encounter?.patient_ihs_id;
  const patientName = encounter?.patient_name || encounter?.nama_pasien || 'Pasien';

  // State Diagnosa ICD-10 (menyimpan objek {code, display} hasil pilihan dari master icd10.json)
  const [selectedIcdItem, setSelectedIcdItem] = useState(null);
  const [conditionStatus, setConditionStatus] = useState(null);

  // State Keluhan & Resep Obat
  const [complaintText, setComplaintText] = useState('');
  const [selectedDrug, setSelectedDrug] = useState(KFA_DRUGS[0].code);
  const [dosageText, setDosageText] = useState('3 kali sehari 1 tablet sesudah makan');
  const [quantity, setQuantity] = useState(10);
  const [observationStatus, setObservationStatus] = useState(null);
  const [medicationStatus, setMedicationStatus] = useState(null);
=======

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
>>>>>>> e41d4bdb8d134e2706a0a35ff157eaea5854b734

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
<<<<<<< HEAD
        <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '320px', margin: '0 auto' }}>
          Silakan pilih pasien di daftar antrean lalu klik tombol <b>Periksa</b>.
=======
        <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>
          Silakan pilih satu pasien di tabel antrean untuk mulai memeriksa & menginput data rekam medis.
>>>>>>> e41d4bdb8d134e2706a0a35ff157eaea5854b734
        </p>
      </div>
    );
  }

<<<<<<< HEAD
  // --- HANDLER KIRIM KELUHAN (OBSERVATION) --- (persis CONNECT)
  const handleSendComplaint = async () => {
    if (!complaintText.trim()) {
      alert('Tulis keluhan pasien terlebih dahulu!');
      return;
    }
    if (!encounterId) {
      alert('Encounter ID tidak ditemukan! Pastikan antrean sudah berstatus TERKONEKSI.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/rme/complaint', {
        encounterIhsId: encounterId,
        patientIhsId: patientIhs,
        patientName: patientName,
        complaintText: complaintText
      });
      setObservationStatus(`Tersimpan (ID: ${res.data.observationId})`);
      alert('Keluhan/Anamnesis berhasil tercatat ke SATUSEHAT!');
    } catch (err) {
      alert('Gagal mengirim keluhan: ' + (err.response?.data?.error?.issue?.[0]?.details?.text || err.message));
    }
  };

  // --- HANDLER KIRIM RESEP (MEDICATION REQUEST) --- (persis CONNECT)
  const handleSendPrescription = async () => {
    if (!encounterId) {
      alert('Encounter ID tidak ditemukan! Pastikan antrean sudah berstatus TERKONEKSI.');
      return;
    }

    const drug = KFA_DRUGS.find((d) => d.code === selectedDrug);

    try {
      const res = await axios.post('http://localhost:5000/api/rme/prescription', {
        encounterIhsId: encounterId,
        patientIhsId: patientIhs,
        patientName: patientName,
        kfaCode: drug.code,
        kfaDisplay: drug.name,
        dosageText: dosageText,
        quantity: quantity
      });
      setMedicationStatus(`Tersimpan (ID: ${res.data.medicationRequestId})`);
      alert('Resep obat berhasil tercatat ke SATUSEHAT!');
    } catch (err) {
      alert('Gagal mengirim resep obat: ' + (err.response?.data?.error?.issue?.[0]?.details?.text || err.message));
    }
  };

  // --- HANDLER KIRIM DIAGNOSA (CONDITION) --- (persis CONNECT, termasuk fallback route)
  const handleSendCondition = async () => {
    if (!selectedIcdItem) {
      alert('Pilih diagnosa ICD-10 terlebih dahulu!');
      return;
    }
    if (!encounterId) {
      alert('Encounter ID tidak ditemukan!');
      return;
    }

    const targetIcd = selectedIcdItem;

    try {
      const payload = {
        encounterIhsId: encounterId,
        patientIhsId: patientIhs,
        patientName: patientName,
        icd10Code: targetIcd.code,
        icd10Display: targetIcd.display,
        display: targetIcd.display
      };

      try {
        await axios.post('http://localhost:5000/api/condition', payload);
      } catch (fallbackErr) {
        if (fallbackErr.response?.status === 404) {
          await axios.post('http://localhost:5000/api/rme/condition', payload);
        } else {
          throw fallbackErr;
        }
      }

      setConditionStatus('Tersimpan di SatuSehat');
      alert('Diagnosa berhasil dikirim ke SATUSEHAT!');
    } catch (err) {
      const rawError = err.response?.data?.error;
      const errorMsg = rawError?.issue?.[0]?.details?.text
        || rawError?.message
        || (typeof rawError === 'string' ? rawError : JSON.stringify(rawError))
        || err.message;

      alert('Gagal mengirim diagnosa: ' + errorMsg);
    }
  };

  // --- HANDLER SELESAIKAN PEMERIKSAAN --- (persis CONNECT, termasuk fallback route)
  const handleCloseEncounter = async () => {
    const payload = {
      encounterId: encounter.id,
      encounterIhsId: encounterId,
      patientIhsId: patientIhs,
      patientName: patientName,
      startTime: encounter.start_time
    };

    try {
      let res;
      try {
        // Coba rute /api/encounter/finish terlebih dahulu
        res = await axios.post('http://localhost:5000/api/encounter/finish', payload);
      } catch (err1) {
        if (err1.response?.status === 404) {
          // Fallback ke /api/encounter/close
          res = await axios.post('http://localhost:5000/api/encounter/close', payload);
        } else {
          throw err1;
        }
      }

      alert('Pemeriksaan berhasil diselesaikan!');
      onFinished();
    } catch (err) {
      const rawError = err.response?.data?.error;
      const errorMsg = typeof rawError === 'string'
        ? rawError
        : (rawError?.issue?.[0]?.details?.text || rawError?.message || err.message);
      alert('Gagal menutup encounter: ' + errorMsg);
    }
  };
=======
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
      // 1. Simpan Rekam Medis Lokal (Anamnesis, Fisik, Catatan)
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

      // 2. Sync Keluhan Utama (Observation) ke SATUSEHAT jika terkoneksi
      if (encounter.satusehat_encounter_id && encounter.patient_ihs_id && keluhanUtama.trim()) {
        try {
          await api.post('/rme/complaint', {
            encounterIhsId: encounter.satusehat_encounter_id,
            patientIhsId: encounter.patient_ihs_id,
            patientName: encounter.patient_name,
            complaintText: keluhanUtama
          });
        } catch (obsErr) {
          console.warn('Gagal sinkron keluhan ke SATUSEHAT:', obsErr.message);
        }
      }

      // 3. Sync Resep Obat (MedicationRequest) ke SATUSEHAT jika ada resep
      if (encounter.satusehat_encounter_id && encounter.patient_ihs_id && isResepObat && resepObat.trim()) {
        try {
          await api.post('/rme/prescription', {
            encounterIhsId: encounter.satusehat_encounter_id,
            patientIhsId: encounter.patient_ihs_id,
            patientName: encounter.patient_name,
            kfaCode: '93001019',
            kfaDisplay: resepObat,
            dosageText: resepObat,
            quantity: 10
          });
        } catch (medErr) {
          console.warn('Gagal sinkron resep ke SATUSEHAT:', medErr.message);
        }
      }

      // 4. Kirim Setiap Diagnosa ke SATUSEHAT (Lokal Condition)
      for (const diag of selectedDiagnoses) {
        await api.post('/conditions', {
          encounter_id: encounter.id,
          icd10_code: diag.code,
          icd10_display: diag.display
        });
      }

      // 5. Close Encounter di SATUSEHAT Cloud & DB Lokal
      try {
        await api.post('/encounter/close', {
          encounterId: encounter.id,
          encounterIhsId: encounter.satusehat_encounter_id,
          patientIhsId: encounter.patient_ihs_id,
          patientName: encounter.patient_name,
          startTime: encounter.created_at
        });
      } catch (closeErr) {
        // Fallback ke endpoint encounters finish jika perlu
        await api.put(`/encounters/${encounter.id}/finish`);
      }

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
>>>>>>> e41d4bdb8d134e2706a0a35ff157eaea5854b734

  // ================== TAMPILAN GAYA UI/UX (tidak mengubah logic di atas) ==================

  const SectionTitle = ({ icon, children }) => (
    <h5 style={{ fontSize: '14px', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px' }}>
      <i className={`fas ${icon}`} style={{ marginRight: '8px' }} />
      {children}
    </h5>
  );

  return (
    <div className="card-bright" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <div className="card-title" style={{ position: 'sticky', top: '-20px', background: 'var(--bg-card)', zIndex: 10, paddingTop: '20px' }}>
        <div className="card-title-icon" style={{ background: '#dcfce7', color: '#10b981' }}>
          <i className="fas fa-file-medical" />
        </div>
        <div>
          <span>Rekam Medis Elektronik (RME)</span>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
<<<<<<< HEAD
            Encounter SatuSehat ID: {encounterId || 'Belum Ada ID'}
=======
            Lengkapi data sebelum menyelesaikan pemeriksaan
>>>>>>> e41d4bdb8d134e2706a0a35ff157eaea5854b734
          </span>
        </div>
      </div>

      {/* Patient Detail Box */}
<<<<<<< HEAD
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
          <i className="fas fa-user-injured" style={{ color: '#0284c7', marginRight: '6px' }} />
          {patientName} <span style={{ fontWeight: '500', color: '#64748b', fontSize: '12px' }}>(IHS: {patientIhs || '-'})</span>
        </div>
      </div>

      {/* 1. KELUHAN & ANAMNESIS (Observation) */}
      <div style={{ marginBottom: '24px' }}>
        <SectionTitle icon="fa-comments-medical">Keluhan Pasien / Anamnesis</SectionTitle>
        <textarea
          rows={2}
          className="input-bright"
          placeholder="Contoh: Pasien pusing berputar sejak 2 hari lalu..."
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
        />
        <button onClick={handleSendComplaint} className="btn btn-primary" style={{ marginTop: '10px' }}>
          <i className="fas fa-paper-plane" />
          Kirim Keluhan (Observation)
        </button>
        {observationStatus && (
          <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '13px', fontWeight: '600' }}>
            <i className="fas fa-check-circle" /> {observationStatus}
          </div>
        )}
      </div>

      {/* 2. DIAGNOSA ICD-10 (Condition) */}
      <div style={{ marginBottom: '24px' }}>
        <SectionTitle icon="fa-clipboard-check">Diagnosa Primer (ICD-10)</SectionTitle>
        <div style={{ marginBottom: '10px' }}>
          <Icd10Search
            value={selectedIcdItem?.code}
            onSelect={(item) => setSelectedIcdItem(item)}
          />
        </div>
        {selectedIcdItem && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px',
            fontSize: '13px', marginBottom: '10px'
          }}>
            <span style={{ background: '#15803d', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginRight: '8px', fontWeight: '700' }}>
              {selectedIcdItem.code}
            </span>
            {selectedIcdItem.display}
          </div>
        )}
        <button onClick={handleSendCondition} className="btn btn-primary">
          <i className="fas fa-paper-plane" />
          Kirim Diagnosa (Condition)
        </button>
        {conditionStatus && (
          <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '13px', fontWeight: '600' }}>
            <i className="fas fa-check-circle" /> {conditionStatus}
          </div>
        )}
      </div>

      {/* 3. RESEP OBAT (KFA / MedicationRequest) */}
      <div style={{ marginBottom: '24px' }}>
        <SectionTitle icon="fa-prescription">Resep Obat (KFA Kemenkes)</SectionTitle>
        <select
          value={selectedDrug}
          onChange={(e) => setSelectedDrug(e.target.value)}
          className="input-bright"
          style={{ marginBottom: '10px', cursor: 'pointer' }}
        >
          {KFA_DRUGS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name} (KFA: {d.code})
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Aturan Pakai"
            value={dosageText}
            onChange={(e) => setDosageText(e.target.value)}
            className="input-bright"
            style={{ flex: 2 }}
          />
          <input
            type="number"
            placeholder="Jumlah"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input-bright"
            style={{ flex: 1 }}
          />
        </div>

        <button onClick={handleSendPrescription} className="btn" style={{ background: '#0d9488', color: '#fff' }}>
          <i className="fas fa-paper-plane" />
          Kirim Resep (MedicationRequest)
        </button>
        {medicationStatus && (
          <div style={{ marginTop: '8px', color: '#16a34a', fontSize: '13px', fontWeight: '600' }}>
            <i className="fas fa-check-circle" /> {medicationStatus}
          </div>
        )}
      </div>

      {/* 4. SELESAIKAN PEMERIKSAAN */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '2px solid #f1f5f9', position: 'sticky', bottom: '-20px', background: 'var(--bg-card)', zIndex: 10, paddingBottom: '20px' }}>
        <button
          onClick={handleCloseEncounter}
          className="btn btn-danger"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          <i className="fas fa-check-double" />
          Selesaikan Pemeriksaan (Close Encounter)
=======
      <div style={{
        background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
            <i className="fas fa-user-injured" style={{ color: '#0284c7', marginRight: '6px' }} />
            {encounter.patient_name || 'Pasien Rawat Jalan'}
          </div>
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

      {/* Block 2 & 3: Pemeriksaan Fisik & Diagnosis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {/* Block 2: Pemeriksaan Fisik */}
        <div>
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
        <div>
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
      </div>

      {/* Block 4: Catatan Dokter (Tindakan & Resep) */}
      <div style={{ marginBottom: '24px' }}>
        <h5 style={{ fontSize: '14px', color: '#0284c7', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px' }}>
          <i className="fas fa-prescription" style={{ marginRight: '8px' }} />
          Catatan Dokter: Tindakan & Resep
        </h5>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Tindakan Toggle */}
          <div>
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
                 <textarea className="input-bright" rows={3} value={permintaanTindakan} onChange={e => setPermintaanTindakan(e.target.value)} placeholder="Tuliskan jenis/rincian tindakan yang diminta..." />
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
>>>>>>> e41d4bdb8d134e2706a0a35ff157eaea5854b734
        </button>
      </div>
    </div>
  );
}
