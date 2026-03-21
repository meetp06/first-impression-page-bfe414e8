import './ConfidenceBadge.css';

export default function ConfidenceBadge({ score, size = 'sm' }) {
  const getLevel = (s) => {
    if (s >= 85) return { label: 'High', className: 'confidence--high' };
    if (s >= 70) return { label: 'Medium', className: 'confidence--medium' };
    return { label: 'Low', className: 'confidence--low' };
  };

  const { label, className } = getLevel(score);

  return (
    <div className={`confidence-badge confidence-badge--${size} ${className}`}>
      <span className="confidence-badge__score">{score}</span>
      <span className="confidence-badge__label">{label}</span>
    </div>
  );
}
