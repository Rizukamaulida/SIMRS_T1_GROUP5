import React from 'react';

export default function SyncBadge({ status, ihsId }) {
  let bgColor = '#f1f5f9';
  let textColor = '#475569';
  let borderColor = '#cbd5e1';
  let iconClass = 'fa-clock';
  let label = 'PENDING';
  let isPulse = false;

  if (status === 'SYNCED') {
    bgColor = '#dcfce7';
    textColor = '#15803d';
    borderColor = '#86efac';
    iconClass = 'fa-check-circle';
    label = 'SYNCED';
    isPulse = true;
  } else if (status === 'FAILED') {
    bgColor = '#ffe4e6';
    textColor = '#be123c';
    borderColor = '#fca5a5';
    iconClass = 'fa-exclamation-triangle';
    label = 'GAGAL SYNC';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: '700',
        borderRadius: '9999px',
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        gap: '5px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        letterSpacing: '0.2px',
        whiteSpace: 'nowrap'
      }}
      title={ihsId ? `SATUSEHAT ID: ${ihsId}` : 'Belum sinkron ke SATUSEHAT FHIR'}
    >
      <span
        className={isPulse ? 'pulse-dot-success' : ''}
        style={{
          height: '7px',
          width: '7px',
          borderRadius: '50%',
          backgroundColor: textColor,
          display: 'inline-block'
        }}
      />
      <i className={`fas ${iconClass}`} style={{ fontSize: '11px' }} />
      {label}
    </span>
  );
}