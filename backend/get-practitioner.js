import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function findPractitioner() {
  try {
    // 1. Ambil Token
    const params = new URLSearchParams();
    params.append('client_id', process.env.SATUSEHAT_CLIENT_ID);
    params.append('client_secret', process.env.SATUSEHAT_CLIENT_SECRET);

    const authRes = await axios.post(
      `${process.env.SATUSEHAT_AUTH_URL}/accesstoken?grant_type=client_credentials`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const token = authRes.data.access_token;
    console.log('✅ Token didapat!');

    // 2. Cari Praktisi staging resmi berdasarkan nama umum dokter testing Kemenkes
    const queries = ['Voigt', 'Budi', 'Dokter', 'Agus'];
    
    for (const q of queries) {
      try {
        const res = await axios.get(
          `${process.env.SATUSEHAT_FHIR_URL}/Practitioner?name=${q}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.entry && res.data.entry.length > 0) {
          const practitioner = res.data.entry[0].resource;
          console.log('\n🎉 PRAKTISI VALID DITEMUKAN:');
          console.log('IHS ID Dokter :', practitioner.id);
          console.log('Nama Dokter   :', practitioner.name?.[0]?.text || q);
          console.log('\nSalin IHS ID di atas ke baris DEFAULT_PRACTITIONER_IHS di file backend/.env');
          return;
        }
      } catch (errLoop) {
        // lanjut query berikutnya jika gagal
      }
    }

    console.log('\nPencarian nama belum menghasilkan entry.');
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

<<<<<<< HEAD
findPractitioner();
=======
findPractitioner();
>>>>>>> e41d4bdb8d134e2706a0a35ff157eaea5854b734
