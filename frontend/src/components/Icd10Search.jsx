import React from 'react';

// Contoh list master ICD-10 primer umum
const COMMON_ICD10 = [
  { code: 'A09', display: 'Infectious gastroenteritis and colitis, unspecified' },
  { code: 'J00', display: 'Acute nasopharyngitis [common cold]' },
  { code: 'I10', display: 'Essential (primary) hypertension' },
  { code: 'E11.9', display: 'Type 2 diabetes mellitus without complications' },
  { code: 'R50.9', display: 'Fever, unspecified' },
  { code: 'K29.7', display: 'Gastritis, unspecified' }
];

export default function Icd10Search({ onSelect }) {
  return (
    <div style={{ marginTop: '8px' }}>
      <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Pilih Diagnosa Primer (ICD-10):</label>
      <select
        onChange={(e) => {
          const item = COMMON_ICD10.find((x) => x.code === e.target.value);
          if (item) onSelect(item);
        }}
        defaultValue=""
        style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        <option value="" disabled>-- Pilih Diagnosa ICD-10 --</option>
        {COMMON_ICD10.map((d) => (
          <option key={d.code} value={d.code}>
            {d.code} - {d.display}
          </option>
        ))}
      </select>
    </div>
  );
}