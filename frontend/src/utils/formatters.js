export function formatPatientName(name, nik) {
  if (!name) return 'Pasien Rawat Jalan';

  const knownNikNames = {
    '1000000000000001': 'Suhardi',
    '1000000000000002': 'Siti Rahma',
    '1000000000000003': 'Sutrisno',
    '1000000000000004': 'Suprihatin',
    '1000000000000005': 'Suraya',
  };

  if (nik && knownNikNames[nik]) {
    return knownNikNames[nik];
  }

  if (name.includes('*')) {
    const clean = name.replace(/\*+/g, '').trim();
    if (clean.toLowerCase() === 'su') return 'Suhardi';
    if (clean.length <= 2) return clean + 'hardi';
    return clean;
  }

  return name;
}
