export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 13, width: '40%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 11, width: '25%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 14 }} />
      <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div className="skeleton" style={{ height: 32, width: 70, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 32, width: 90, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 32, width: 70, borderRadius: 8 }} />
      </div>
    </div>
  );
}