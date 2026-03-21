import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './KPICard.css';

export default function KPICard({ icon: Icon, label, value, trend, trendValue, index = 0 }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendClass = trend === 'up' ? 'kpi-card__trend--up' : trend === 'down' ? 'kpi-card__trend--down' : '';

  return (
    <motion.div
      className="kpi-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="kpi-card__icon">
        <Icon size={20} />
      </div>
      <div className="kpi-card__content">
        <span className="kpi-card__label">{label}</span>
        <motion.span
          className="kpi-card__value"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          key={value}
        >
          {value}
        </motion.span>
      </div>
      {trendValue && (
        <div className={`kpi-card__trend ${trendClass}`}>
          <TrendIcon size={14} />
          <span>{trendValue}</span>
        </div>
      )}
    </motion.div>
  );
}
