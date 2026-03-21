import { Shield, ShieldAlert, ShieldQuestion } from 'lucide-react';
import './VerificationBadge.css';

const config = {
  verified: {
    icon: Shield,
    label: 'Verified',
    className: 'verification--verified',
  },
  verified_with_warnings: {
    icon: ShieldAlert,
    label: 'Warnings',
    className: 'verification--warning',
  },
  needs_review: {
    icon: ShieldQuestion,
    label: 'Needs Review',
    className: 'verification--review',
  },
};

export default function VerificationBadge({ status, size = 'sm' }) {
  const cfg = config[status] || config.needs_review;
  const Icon = cfg.icon;

  return (
    <div className={`verification-badge verification-badge--${size} ${cfg.className}`}>
      <Icon size={size === 'lg' ? 16 : 12} />
      <span>{cfg.label}</span>
    </div>
  );
}
