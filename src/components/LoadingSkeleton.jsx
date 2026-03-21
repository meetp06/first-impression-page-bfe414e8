import './LoadingSkeleton.css';

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-row">
        <div className="skeleton skeleton--badge" />
        <div className="skeleton skeleton--badge" />
      </div>
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text skeleton--short" />
      <div className="skeleton-row">
        <div className="skeleton skeleton--tag" />
        <div className="skeleton skeleton--tag" />
      </div>
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="skeleton-kpi">
      <div className="skeleton skeleton--icon" />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton--text skeleton--short" />
        <div className="skeleton skeleton--title" style={{ width: '60px', height: '28px' }} />
      </div>
    </div>
  );
}
