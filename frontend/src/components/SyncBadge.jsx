import React from 'react';

export default function SyncBadge({ status, ihsId }) {
  let bgColor = '#e2e8f0';
  let textColor = '#475569';
  let label = 'PENDING';

  if (status === 'SYNCED') {
    bgColor = '#dcfce7';
    textColor = '#166534';
    label = 'TERKONEKSI SATUSEHAT';
  } else if (status === 'FAILED') {
    bgColor = '#fee2e2';
    textColor = '#991b1b';
    label = 'GAGAL SYNC';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: 'bold',
        borderRadius: '9999px',
        backgroundColor: bgColor,
        color: textColor,
        gap: '4px'
      }}
      title={ihsId ? `IHS ID: ${ihsId}` : 'Belum memiliki ID SATUSEHAT'}
    >
      <span style={{ height: '6px', width: '6px', borderRadius: '50%', backgroundColor: textColor }} />
      {label}
    </span>
  );
}